import os
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, abort
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from models import db, User, Post, File


def create_app():
    app = Flask(__name__)

    # instance/ klasörü (db ve uploads burada dursun)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(app.instance_path, 'factshield.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    upload_dir = os.path.join(app.instance_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_dir
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "login"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # -------- ROUTES --------

    @app.route("/")
    def index():
        posts = Post.query.order_by(Post.date.desc()).all()
        return render_template("index.html", posts=posts)

    @app.route("/post/<int:post_id>")
    def post_detail(post_id: int):
        post = Post.query.get_or_404(post_id)
        return render_template("post_detail.html", post=post)

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("admin_dashboard"))

        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")

            user = User.query.filter_by(username=username).first()
            if user and check_password_hash(user.password_hash, password):
                login_user(user)
                return redirect(url_for("admin_dashboard"))

            flash("Invalid credentials.", "error")

        return render_template("login.html")

    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        flash("Logged out.", "success")
        return redirect(url_for("index"))

    @app.route("/admin", methods=["GET", "POST"])
    @login_required
    def admin_dashboard():
        if request.method == "POST":
            title = (request.form.get("title") or "").strip()
            author = (request.form.get("author") or "").strip()
            content = (request.form.get("content") or "").strip()

            if not title or not author or not content:
                flash("Title/Author/Content required.", "error")
                return redirect(url_for("admin_dashboard"))

            new_post = Post(title=title, author=author, content=content)
            db.session.add(new_post)
            db.session.flush()  # new_post.id gelsin

            files = request.files.getlist("files")
            for f in files:
                if not f or not f.filename:
                    continue
                safe = secure_filename(f.filename)
                # çakışma olmasın diye post_id ile prefix
                stored_name = f"{new_post.id}_{safe}"
                f.save(os.path.join(app.config["UPLOAD_FOLDER"], stored_name))
                db.session.add(File(filename=stored_name, post_id=new_post.id))

            db.session.commit()
            flash("Case file added successfully.", "success")
            return redirect(url_for("admin_dashboard"))

        posts = Post.query.order_by(Post.date.desc()).all()
        return render_template("admin.html", posts=posts)

    @app.route("/admin/delete/<int:post_id>", methods=["POST"])
    @login_required
    def delete_post(post_id: int):
        post = Post.query.get_or_404(post_id)

        # fiziksel dosyaları sil
        for f in post.files:
            try:
                os.remove(os.path.join(app.config["UPLOAD_FOLDER"], f.filename))
            except OSError:
                pass

        db.session.delete(post)
        db.session.commit()
        flash("Case file deleted.", "success")
        return redirect(url_for("admin_dashboard"))

    @app.route("/uploads/<path:filename>")
    def download_file(filename: str):
        # basit güvenlik: db’de var mı kontrol et
        exists = File.query.filter_by(filename=filename).first()
        if not exists:
            abort(404)
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=True)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
