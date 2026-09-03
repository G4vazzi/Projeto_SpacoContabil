from flask import (
    Blueprint,
    render_template,
)

sobre_bp = Blueprint('sobre', __name__)

@sobre_bp.route('/quemsomos')
def quemsomos():
    return render_template(
        'quemsomos.html'
        )

@sobre_bp.route('/nossaequipe')
def nossaequipe():
    return render_template(
        'nossaequipe.html'
        )

@sobre_bp.route('/porqueescolher')
def porqueescolher():
    return render_template(
        'porqueescolher.html'
        )

@sobre_bp.route('/contato')
def contato():
    return render_template(
        'contato.html'
        )