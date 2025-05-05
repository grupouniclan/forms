document.addEventListener('DOMContentLoaded', function () {
    // Configuração inicial
    const urlParams = new URLSearchParams(window.location.search);
    const parceiroParam = urlParams.get('parceiro');
    let parceiroNome = 'Anônimo';
    
    // Elementos do DOM
    const form = document.getElementById('uniclanForm');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const lgpdCheckbox = document.getElementById('lgpd');
    const campoPlano = document.querySelector('.campo-plano');

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

    // Controle de exibição do campo de plano
    document.querySelectorAll('input[name="temPlano"]').forEach(input => {
        input.addEventListener('change', () => {
            campoPlano.style.display = input.value === 'Sim' ? 'block' : 'none';
        });
    });

    // Submit do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        const formData = new FormData(form);
        formData.set('parceiro', parceiroNome);

        // Captura dados condicionais do plano
        const temPlano = document.querySelector('input[name="temPlano"]:checked')?.value || 'Não';
        formData.set('temPlano', temPlano);
        if (temPlano === 'Não') formData.set('plano', '');

        try {
            const response = await fetch('SUA_URL_GOOGLE_SCRIPT', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();
            if (result.toLowerCase().includes('ok')) {
                const nome = formData.get('nome');
                const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!`;
                window.location.href = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;
                
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
        }
    });
});