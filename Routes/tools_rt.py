from flask import (
    Blueprint,
    render_template,
)

tools_bp = Blueprint('tools', __name__)

@tools_bp.route('/calculadoraAberturaEmpresa')
def calculadoraAberturaEmpresa():
    return render_template(
        'Tools/calculadoraAberturaEmpresa.html'
        )

@tools_bp.route('/calculadoraPJxCLT')
def calculadoraPJxCLT():
    return render_template(
        'Tools/calculadoraPJxCLT.html'
        )

@tools_bp.route('/calculadoraFatorR')
def calculadoraFatorR():
    return render_template(
        'Tools/calculadoraFatorR.html'
        )

@tools_bp.route('/calculadoraRPA')
def calculadoraRPA():
    return render_template(
        'Tools/calculadoraRPA'
    )

@tools_bp.route('/calculadoraReformaTributaria')
def calculadoraReformaTributaria():
    return render_template(
        'Tools/calculadorareforma'
    )