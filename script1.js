document.addEventListener('DOMContentLoaded', function () {
    // --- IMPORTANTE: SUBSTITUA ESTA URL PELA SUA NOVA URL DO GOOGLE APPS SCRIPT ---
    const googleSheetURL = 'https://script.google.com/macros/s/AKfycbzLYLJDLJr99E0bGyY8zSInEMvmBHkPHKcKbE-G3q-9E5NLDECXArIRtl66FdLemjLhtg/exec';

    // Elementos DOM
    const form = document.getElementById('uniclanForm');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const lgpdCheckbox = document.getElementById('lgpd');
    const parceiroInput = document.getElementById('parceiro');

    // Máscara do telefone
    $('#telefone').mask('(00) 00000-0000');

    // LGPD Modal
    const lgpdLink = document.getElementById('lgpd-link');
    const lgpdModal = document.getElementById('lgpd-modal');
    const closeModal = document.querySelector('.close-modal');

    if (lgpdLink && lgpdModal && closeModal) {
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
    }

    // Pega o nome do parceiro da URL (se existir)
    const urlParams = new URLSearchParams(window.location.search);
    const parceiroParam = urlParams.get('parceiro');
    let parceiroNome = 'Anônimo';

    if (parceiroParam) {
        parceiroNome = decodeURIComponent(parceiroParam);
        parceiroInput.value = parceiroNome;
        const parceiroInfo = document.createElement('div');
        parceiroInfo.className = 'parceiro-info';
        parceiroInfo.innerHTML = `<i class="fas fa-handshake"></i> Indicado por: <strong>${parceiroNome}</strong>`;
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.appendChild(parceiroInfo);
        }
    }

    // ========== FUNÇÕES DE VALIDAÇÃO ==========
    function validarFormulario() {
        let todosPreenchidos = true;
        limparTodosErros();

        // Validação de campos textuais (apenas nome e telefone)
        const camposObrigatorios = ['#nome', '#telefone'];
        camposObrigatorios.forEach(seletor => {
            const campo = form.querySelector(seletor);
            if (!campo || !campo.value.trim()) {
                if (campo) mostrarErro(campo, 'Este campo é obrigatório');
                todosPreenchidos = false;
            }
        });

        // Validação específica do telefone
        const telefone = form.querySelector('#telefone');
        if (telefone && telefone.value.replace(/\D/g, '').length < 11) {
            mostrarErro(telefone, 'Telefone incompleto');
            todosPreenchidos = false;
        }

        // Validação da LGPD
        if (!lgpdCheckbox || !lgpdCheckbox.checked) {
            const lgpdContainer = lgpdCheckbox.closest('.form-group');
            if (lgpdContainer) mostrarErro(lgpdContainer, 'Você deve aceitar a política de privacidade');
            todosPreenchidos = false;
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
        submitBtn.disabled = !formValido;
    }

    // Eventos de Validação
    if (form) {
        form.addEventListener('input', function(e) {
            limparErro(e.target);
            atualizarBotaoEnvio();
        });
        atualizarBotaoEnvio();
    }

    // ========== ENVIO DO FORMULÁRIO ==========
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validarFormulario()) {
                alert('Por favor, preencha todos os campos obrigatórios corretamente.');
                return;
            }

            loadingSpinner.style.display = 'block';
            submitBtn.style.display = 'none';

            try {
                const nome = form.querySelector('#nome').value;
                const telefone = form.querySelector('#telefone').value;
                
                const formData = new FormData();
                formData.append('nome', nome);
                formData.append('telefone', telefone);
                formData.append('parceiro', parceiroNome);

                const response = await fetch(googleSheetURL, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.text();
                
                if (result.toLowerCase().includes('ok')) {
                    alert('Seus dados foram enviados com sucesso!');
                    form.reset();
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
                atualizarBotaoEnvio();
            }
        });
    }
});
