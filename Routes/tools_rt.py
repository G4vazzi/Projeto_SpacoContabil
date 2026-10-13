from flask import (
    Blueprint,
    jsonify,
    render_template,
    request,
)

from services.iss_nfse import (
    APIExternaErro,
    consultar_aliquota_iss,
    listar_municipios_uf,
    diagnosticar_iss_municipio,
)


tools_bp = Blueprint('tools', __name__)


# =========================================================
# CALCULADORA ABERTURA DE EMPRESA
# =========================================================

@tools_bp.route('/calculadoraAberturaEmpresa')
def calculadoraAberturaEmpresa():

    return render_template(
        'Tools/calculadoraAberturaEmpresa.html'
    )


# =========================================================
# CALCULADORA PJ X CLT
# =========================================================

@tools_bp.route('/calculadoraPJxCLT')
def calculadoraPJxCLT():

    return render_template(
        'Tools/calculadora_pj_clt.html'
    )


# =========================================================
# CALCULADORA FATOR R
# =========================================================

@tools_bp.route('/calculadoraFatorR')
def calculadoraFatorR():

    return render_template(
        'Tools/calculadoraFatorR.html'
    )


# =========================================================
# CALCULADORA RPA
# =========================================================

@tools_bp.route('/calculadoraRPA')
def calculadoraRPA():

    return render_template(
        'Tools/calculadoraRPA.html'
    )


# =========================================================
# CALCULADORA REFORMA TRIBUTÁRIA
# =========================================================

@tools_bp.route('/calculadoraReformaTributaria')
def calculadoraReformaTributaria():

    return render_template(
        'Tools/calculadoraReformaTributaria.html'
    )


# =========================================================
# API - MUNICÍPIOS
# =========================================================

@tools_bp.get('/api/municipios/<uf>')
def api_municipios(uf):

    try:

        municipios = listar_municipios_uf(
            uf
        )

        return jsonify({

            'ok': True,

            'municipios': municipios,

        })


    except ValueError as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

        }), 400


    except APIExternaErro as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

        }), 502


# =========================================================
# API - ISS
# =========================================================

@tools_bp.get('/api/iss')
def api_iss():

    codigo_municipio = request.args.get(
        'municipio',
        ''
    ).strip()


    codigo_servico = request.args.get(
        'servico',
        ''
    ).strip()


    competencia = request.args.get(
        'competencia',
        ''
    ).strip()


    # =====================================================
    # VALIDAÇÃO
    # =====================================================

    if not codigo_municipio:

        return jsonify({

            'ok': False,

            'erro': 'Informe o município.',

        }), 400


    if not codigo_servico:

        return jsonify({

            'ok': False,

            'erro': 'Informe o serviço.',

        }), 400


    # =====================================================
    # CONSULTA NFS-e
    # =====================================================

    try:

        resultado = consultar_aliquota_iss(

            codigo_municipio=codigo_municipio,

            codigo_servico=codigo_servico,

            competencia=competencia,

        )


        return jsonify({

            'ok': True,

            **resultado,

        })


    except ValueError as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

        }), 400


    except APIExternaErro as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

            'fallback_manual': True,

        }), 502



    # =========================================================
    # DEBUG - BASE ISS
    # =========================================================

@tools_bp.get('/api/iss/debug/<municipio>')
def api_iss_debug(municipio):

    try:

        resultado = diagnosticar_iss_municipio(
            municipio
        )

        return jsonify({

            'ok': True,

            **resultado,

        })

    except ValueError as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

        }), 400

    except APIExternaErro as exc:

        return jsonify({

            'ok': False,

            'erro': str(exc),

        }), 502