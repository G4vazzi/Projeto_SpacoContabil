# Spaco Contábil

Site institucional desenvolvido para a **Spaco Contábil**, com foco na apresentação dos serviços contábeis, ferramentas de apoio ao cliente e geração de contatos comerciais.

O projeto foi desenvolvido em **Flask**, com páginas em **HTML/Jinja2**, estilização em **CSS**, interações em **JavaScript** e armazenamento local em **SQLite**.

## Funcionalidades

O site conta com:

- Página inicial institucional;
- Páginas individuais para os principais serviços contábeis;
- Menu de navegação responsivo;
- Formulário de contato em modal;
- Registro de contatos em banco de dados SQLite;
- Envio automático de e-mail de confirmação ao cliente;
- Proteção básica contra envios duplicados e spam;
- Acesso externo ao Portal do Cliente;
- Calculadoras e ferramentas contábeis integradas ao site.

### Ferramentas disponíveis

Entre as ferramentas desenvolvidas estão:

- Calculadora de Abertura de Empresa;
- Calculadora PJ x CLT;
- Calculadora do Fator R;
- Calculadora de RPA;
- Calculadora da Reforma Tributária.

Algumas ferramentas utilizam dados e regras específicas para auxiliar em simulações e comparações. Os resultados possuem caráter informativo e não substituem análise contábil ou tributária profissional.

## Tecnologias utilizadas

- Python
- Flask
- Jinja2
- HTML5
- CSS3
- JavaScript
- SQLite
- Requests
- python-dotenv
- SMTP

## Estrutura do projeto

A estrutura pode variar conforme a evolução do projeto, mas segue aproximadamente este padrão:

```text
Projeto_SpacoContabil/
│
├── app.py
├── requirements.txt
├── .env
├── .gitignore
│
├── Routes/
│   ├── home_rt.py
│   ├── tools_rt.py
│   └── contato_rt.py
│
├── services/
│   └── iss_nfse.py
│
├── templates/
│   ├── Config/
│   │   └── base.html
│   ├── Includes/
│   │   └── contato_modal.html
│   ├── Tools/
│   └── ...
│
├── static/
│   ├── css/
│   ├── js/
│   └── img/
│
└── instance/
    └── spaco_contatos.db
```

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd Projeto_SpacoContabil
```

### 2. Crie um ambiente virtual

No Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 3. Instale as dependências

```powershell
python -m pip install -r requirements.txt
```

Caso o arquivo `requirements.txt` ainda não tenha sido criado:

```powershell
python -m pip install flask requests python-dotenv
python -m pip freeze > requirements.txt
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
FLASK_SECRET_KEY=SUA_CHAVE_SECRETA

SMTP_HOST=SEU_SERVIDOR_SMTP
SMTP_PORT=465

SMTP_USER=SEU_EMAIL
SMTP_PASSWORD=SUA_SENHA

SMTP_FROM=SEU_EMAIL
SMTP_FROM_NAME=Spaco Contábil

SMTP_USE_SSL=true
SMTP_USE_TLS=false
```

> Nunca envie o arquivo `.env` para um repositório público.

### 5. Execute a aplicação

```powershell
python app.py
```

Depois acesse no navegador:

```text
http://127.0.0.1:5000
```

## Formulário de contato

O formulário de contato pode ser aberto em diferentes páginas do site por meio do atributo:

```html
data-abrir-contato
```

Exemplo:

```html
<a href="#" data-abrir-contato>
    Entre em contato
</a>
```

Ao enviar o formulário:

1. os dados são validados;
2. o contato é salvo no SQLite;
3. um e-mail automático de confirmação é enviado ao cliente.

Os dados são armazenados no banco:

```text
instance/spaco_contatos.db
```

## Variáveis de ambiente e segurança

O projeto utiliza variáveis de ambiente para proteger informações sensíveis.

O `.gitignore` deve conter, no mínimo:

```gitignore
.env
instance/
.venv/
__pycache__/
*.pyc
```

Não armazene senhas, tokens ou credenciais diretamente nos arquivos Python, HTML ou JavaScript.

## Portal do Cliente

O site possui acesso externo ao portal utilizado pelos clientes da contabilidade.

Por segurança e estabilidade, o projeto deve utilizar o endereço principal do portal, evitando links temporários de autenticação que contenham parâmetros de sessão.

## Objetivo do projeto

O objetivo do projeto é oferecer à Spaco Contábil uma presença digital moderna, organizada e funcional, permitindo:

- apresentar os serviços da empresa;
- facilitar o contato com potenciais clientes;
- disponibilizar ferramentas úteis;
- melhorar a experiência dos clientes existentes;
- centralizar o acesso aos principais recursos digitais da empresa.

## Melhorias futuras

Algumas melhorias que podem ser adicionadas futuramente:

- Área administrativa para gerenciamento dos contatos;
- Alteração do status dos leads;
- Integração com WhatsApp Business;
- Painel de métricas e conversões;
- Proteção avançada contra spam;
- Integração com CRM;
- Registro da origem do contato e serviço de interesse;
- Publicação em ambiente de produção com HTTPS.

## Autor

Projeto desenvolvido por **Pedro Gavazzi**.

## Licença

Este projeto foi desenvolvido para uso da **Spaco Contábil**.

A utilização, reprodução ou distribuição do conteúdo e do código deve respeitar as regras definidas pelos responsáveis pelo projeto.
