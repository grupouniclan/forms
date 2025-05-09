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

    // Validação LGPD
    if (lgpdCheckbox && submitBtn) {
        submitBtn.disabled = true;
        lgpdCheckbox.addEventListener('change', () => {
            submitBtn.disabled = !lgpdCheckbox.checked;
        });
    }

    // Controle do campo de plano
    function toggleCampoPlano() {
        campoPlano.style.display = planoSim.checked ? 'block' : 'none';
        if (planoSim.checked) {
            document.getElementById('plano').required = true;
        } else {
            document.getElementById('plano').required = false;
        }
    }

    if (planoSim && planoNao && campoPlano) {
        toggleCampoPlano();
        planoSim.addEventListener('change', toggleCampoPlano);
        planoNao.addEventListener('change', toggleCampoPlano);
    }

    // Função de validação
    function validarFormulario() {
        let valido = true;
        const camposObrigatorios = [
            { id: 'nome', mensagem: 'Por favor, preencha seu nome completo' },
            { id: 'email', mensagem: 'O e-mail é obrigatório' },
            { id: 'telefone', mensagem: 'Telefone incompleto' },
            { id: 'temPlano', mensagem: 'Selecione se possui plano de saúde' }
        ];

        // Valida campos básicos
        camposObrigatorios.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            
            if (elemento.type === 'radio') {
                const checked = document.querySelector(`input[name="${campo.id}"]:checked`);
                if (!checked) {
                    alert(campo.mensagem);
                    valido = false;
                }
            } else {
                if (!elemento.value.trim()) {
                    alert(campo.mensagem);
                    elemento.focus();
                    valido = false;
                    return;
                }
            }
        });

        // Validação especial do telefone
        const telefone = document.getElementById('telefone');
        if (!telefone.value || !$('#telefone').mask.mask.isComplete()) {
            alert('Telefone incompleto');
            telefone.focus();
            valido = false;
        }

        // Validação do plano de saúde
        if (planoSim.checked && !document.getElementById('plano').value.trim()) {
            alert('Informe o nome do seu plano atual');
            document.getElementById('plano').focus();
            valido = false;
        }

        return valido;
    }

    // Envio do formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validarFormulario() || !lgpdCheckbox.checked) {
                if (!lgpdCheckbox.checked) {
                    alert('Você precisa aceitar a política de privacidade');
                }
                return;
            }

            loadingSpinner.style.display = 'block';
            submitBtn.style.display = 'none';
            
            const formData = new FormData(form);
            formData.set('parceiro', parceiroNome);

            const temPlano = document.querySelector('input[name="temPlano"]:checked')?.value || 'Não';
            formData.set('temPlano', temPlano);
            formData.set('plano', temPlano === 'Sim' ? document.getElementById('plano').value : '');

            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbzdOaNdhpGjP-GnqHhPwEOdHnDew-t2ftzEXyauJ--q2tfzDGhES7RAe24BRX1I8LY/exec', {
                    method: 'POST',
                    body: formData,
                });
                
                const result = await response.text();
                
                if (result.toLowerCase().includes('ok')) {
                    const nome = formData.get('nome');
                    const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!`;
                    const urlZap = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;
                    window.location.href = urlZap;

                    form.reset();
                    campoPlano.style.display = 'none';
                    lgpdCheckbox.checked = false;
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