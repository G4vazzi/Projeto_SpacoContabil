from flask import(
    Flask,
    render_template,
    redirect,
    url_for,
    Blueprint,

)

from Routes.home_rt import home_bp
from Routes.service_rt import service_bp

app=Flask(__name__)

app.register_blueprint(home_bp)
app.register_blueprint(service_bp)

if __name__=="__main__":
    app.run(debug=True)