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

// ========== VALIDAÇÃO COMPLETA DO FORMULÁRIO ==========
function validarFormulario() {
    // Verifica todos os campos obrigatórios
    const camposObrigatorios = form.querySelectorAll('[required]');
    let todosPreenchidos = true;
    
    camposObrigatorios.forEach(campo => {
        // Verifica campos de texto e selects
        if (campo.type !== 'radio' && campo.type !== 'checkbox' && !campo.value.trim()) {
            todosPreenchidos = false;
        }
        
        // Verificação específica para telefone com máscara completa
        if (campo.id === 'telefone' && campo.value.replace(/\D/g, '').length < 11) {
            todosPreenchidos = false;
        }
    });

    // Verificação condicional do campo plano
    if (planoSim.checked && !campoPlano.querySelector('input').value.trim()) {
        todosPreenchidos = false;
    }

    return todosPreenchidos;
}

function atualizarBotaoEnvio() {
    const formValido = validarFormulario();
    const lgpdAceito = lgpdCheckbox.checked;
    
    submitBtn.disabled = !(formValido && lgpdAceito);
    
    // Feedback visual adicional se necessário
    if (!formValido && lgpdAceito) {
        submitBtn.title = 'Preencha todos os campos obrigatórios';
    } else {
        submitBtn.title = '';
    }
}

if (lgpdCheckbox && submitBtn) {
    // Valida em qualquer alteração no formulário
    form.addEventListener('input', atualizarBotaoEnvio);
    
    // Valida também no change do checkbox LGPD
    lgpdCheckbox.addEventListener('change', atualizarBotaoEnvio);
    
    // Validação inicial
    atualizarBotaoEnvio();
}

    // Controle do campo de plano
    function toggleCampoPlano() {
        campoPlano.style.display = planoSim.checked ? 'block' : 'none';
    }

    if (planoSim && planoNao && campoPlano) {
        // Configura estado inicial
        toggleCampoPlano();
        
        // Adiciona listeners
        planoSim.addEventListener('change', toggleCampoPlano);
        planoNao.addEventListener('change', toggleCampoPlano);
    }

    // Envio do formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
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
                console.log('Resposta do servidor:', result);

                if (result.toLowerCase().includes('ok')) {
                    // Redireciona para WhatsApp
                    const nome = formData.get('nome');
                    const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!#Form`;
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
