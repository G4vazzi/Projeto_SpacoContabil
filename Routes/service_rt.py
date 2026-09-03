from flask import (
    Blueprint,
    render_template,
)

service_bp = Blueprint('service', __name__)

@service_bp.route('/abrasuaempresa')
def abrasuaempresa():
    return render_template(
        'Service/abertura_empresa.html'
        )

@service_bp.route('/deixardesermei')
def deixardesermei():
    return render_template(
        'Service/deixar_mei.html'
        )

@service_bp.route('/trocarcontador')
def trocarcontador():
    return render_template(
        'Service/trocar_contador.html'
        )

@service_bp.route('/contabilidadecompleta')
def contabilidadecompleta():    
    return render_template(
        'Service/contabilidade_completa.html'
        )

@service_bp.route('/assessoriacontabil')
def assessoriacontabil():
    return render_template(
        'Service/assessoria_contabil.html'
        )

@service_bp.route('/planejamentotributario')
def planejamentotributario():
    return render_template(
        'Service/planejamento_tributario.html'
        )