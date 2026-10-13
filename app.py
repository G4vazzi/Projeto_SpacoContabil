from flask import(
    Flask,
    render_template,
    redirect,
    url_for,
    Blueprint,

)

from Routes.home_rt import home_bp
from Routes.service_rt import service_bp
from Routes.sobre_rt import sobre_bp
from Routes.tools_rt import tools_bp
from Routes.contato_rt import contato_bp

app=Flask(__name__)

app.register_blueprint(home_bp)
app.register_blueprint(service_bp)
app.register_blueprint(sobre_bp)
app.register_blueprint(tools_bp)
app.register_blueprint(contato_bp)

@app.route("/health")
def health():
    return {
        "status": "ok",
        "aplicacao": "Spaco Contabil"
    }, 200

if __name__=="__main__":
    app.run(debug=True)