document.addEventListener('DOMContentLoaded', function () {
    // Configuração inicial
    const urlParams = new URLSearchParams(window.location.search);
    const parceiroParam = urlParams.get('parceiro');
    let parceiroNome = 'Anônimo';

    // Elementos DOM
    const form = document.getElementById('uniclanForm');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const lgpdCheckbox = document.getElementById('lgpd');
    const campoPlano = document.getElementById('campo-nome-plano');
    const planoSim = document.getElementById('plano-sim');
    const planoNao = document.getElementById('plano-nao');

    // Configura parceiro
    if (parceiroParam) {
        parceiroNome = decodeURIComponent(parceiroParam);
        document.getElementById('parceiro').value = parceiroNome;
        
        const parceiroInfo = document.createElement('div');
        parceiroInfo.className = 'parceiro-info';
        parceiroInfo.innerHTML = `<i class="fas fa-handshake"></i> Indicado por: <strong>${parceiroNome}</strong>`;
        document.querySelector('.welcome-message').appendChild(parceiroInfo);
        document.getElementById('indicacao').checked = true;
    }

    // Máscara do telefone
    $('#telefone').mask('(00) 00000-0000');

    // LGPD Modal
    const lgpdLink = document.getElementById('lgpd-link');
    const lgpdModal = document.getElementById('lgpd-modal');
    const closeModal = document.querySelector('.close-modal');

    lgpdLink.addEventListener('click', (e) => {
        e.preventDefault();
        lgpdModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        lgpdModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === lgpdModal) lgpdModal.style.display = 'none';
    });

    // ========== FUNÇÕES DE VALIDAÇÃO ==========
    function validarFormulario() {
        let todosPreenchidos = true;
        limparTodosErros();

        // Validação de campos textuais
        const camposObrigatorios = ['#nome', '#telefone', '#cidade', '#email'];
        camposObrigatorios.forEach(seletor => {
            const campo = form.querySelector(seletor);
            if (!campo.value.trim()) {
                mostrarErro(campo, 'Este campo é obrigatório');
                todosPreenchidos = false;
            }
        });

        // Validação específica do telefone
        const telefone = form.querySelector('#telefone');
        if (telefone.value.replace(/\D/g, '').length < 11) {
            mostrarErro(telefone, 'Telefone incompleto');
            todosPreenchidos = false;
        }

        // Validação de e-mail
        const email = form.querySelector('#email');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            mostrarErro(email, 'E-mail inválido');
            todosPreenchidos = false;
        }

        // Validação de grupos de rádio
        const gruposRadio = [
            { name: 'temPlano', msg: 'Selecione se possui plano' },
            { name: 'conheceu', msg: 'Selecione como conheceu' },
            { name: 'contato', msg: 'Selecione o contato preferido' }
        ];

        gruposRadio.forEach(grupo => {
            const selecionado = form.querySelector(`input[name="${grupo.name}"]:checked`);
            if (!selecionado) {
                const container = form.querySelector(`input[name="${grupo.name}"]`).closest('.form-group');
                mostrarErro(container, grupo.msg);
                todosPreenchidos = false;
            }
        });

        // Validação condicional do plano
        if (planoSim.checked) {
            const inputPlano = campoPlano.querySelector('input');
            if (!inputPlano.value.trim()) {
                mostrarErro(inputPlano, 'Informe o nome do plano');
                todosPreenchidos = false;
            }
        }

        return todosPreenchidos;
    }

    function mostrarErro(elemento, mensagem) {
        const container = elemento.closest('.form-group');
        const errorDiv = container.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = mensagem;
            container.classList.add('erro');
        }
    }

    function limparErro(elemento) {
        const container = elemento.closest('.form-group');
        if (container) {
            const errorDiv = container.querySelector('.error-message');
            if (errorDiv) errorDiv.textContent = '';
            container.classList.remove('erro');
        }
    }

    function limparTodosErros() {
        form.querySelectorAll('.form-group').forEach(container => {
            container.classList.remove('erro');
            const errorDiv = container.querySelector('.error-message');
            if (errorDiv) errorDiv.textContent = '';
        });
    }

    function atualizarBotaoEnvio() {
        const formValido = validarFormulario();
        const lgpdAceito = lgpdCheckbox.checked;
        submitBtn.disabled = !(formValido && lgpdAceito);
    }

    // ========== EVENTOS DE VALIDAÇÃO ==========
    if (form) {
        // Validação em tempo real
        form.addEventListener('input', function(e) {
            limparErro(e.target);
            atualizarBotaoEnvio();
        });

        // Validação de radios
        form.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const container = radio.closest('.form-group');
                limparErro(container);
                atualizarBotaoEnvio();
            });
        });

        // Validação inicial
        atualizarBotaoEnvio();
    }

    // ========== CONTROLE DO CAMPO DE PLANO ==========
    function toggleCampoPlano() {
        campoPlano.style.display = planoSim.checked ? 'block' : 'none';
        if (!planoSim.checked) campoPlano.querySelector('input').value = '';
        atualizarBotaoEnvio();
    }

    if (planoSim && planoNao && campoPlano) {
        toggleCampoPlano();
        planoSim.addEventListener('change', toggleCampoPlano);
        planoNao.addEventListener('change', toggleCampoPlano);
    }

    // ========== ENVIO DO FORMULÁRIO ==========
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validação final
            const formValido = validarFormulario();
            const lgpdAceito = lgpdCheckbox.checked;
            
            if (!formValido || !lgpdAceito) {
                alert('Por favor, preencha todos os campos obrigatórios corretamente e aceite a política de privacidade!');
                return;
            }

            loadingSpinner.style.display = 'block';
            submitBtn.style.display = 'none';
            
            const formData = new FormData(form);
            formData.set('parceiro', parceiroNome);

            // Captura valor do plano
            const temPlano = document.querySelector('input[name="temPlano"]:checked')?.value || 'Não';
            formData.set('temPlano', temPlano);
            if (temPlano === 'Não') formData.set('plano', '');

            try {
                // Envia para Google Sheets
                const response = await fetch('https://script.google.com/macros/s/AKfycbzdOaNdhpGjP-GnqHhPwEOdHnDew-t2ftzEXyauJ--q2tfzDGhES7RAe24BRX1I8LY/exec', {
                    method: 'POST',
                    body: formData,
                });
                
                const result = await response.text();
                
                if (result.toLowerCase().includes('ok')) {
                    // Redireciona para WhatsApp
                    const nome = formData.get('nome');
                    const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!`;
                    const urlZap = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;
                    window.location.href = urlZap;

                    // Reset do formulário
                    form.reset();
                    campoPlano.style.display = 'none';
                    if (lgpdCheckbox) lgpdCheckbox.checked = false;

                } else {
                    alert('Erro no servidor: ' + result);
                }
            } catch (err) {
                console.error('Erro:', err);
                alert('Erro na conexão. Verifique sua internet.');
            } finally {
                loadingSpinner.style.display = 'none';
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true;
            }
        });
    }
});
