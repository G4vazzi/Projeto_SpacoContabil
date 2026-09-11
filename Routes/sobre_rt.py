from flask import (
    Blueprint,
    render_template,
)

sobre_bp = Blueprint('sobre', __name__)

@sobre_bp.route('/quemsomos')
def quemsomos():
    return render_template(
        'Others/quemsomos.html'
        )

@sobre_bp.route('/porqueescolher')
def porqueescolher():
    return render_template(
        'Others/porqueescolher.html'
        )

@sobre_bp.route('/contato')
def contato():
    return render_template(
        'Others/contato.html'
        )