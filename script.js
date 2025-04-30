
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const parceiroParam = urlParams.get('parceiro');
    let parceiroNome = 'Anônimo';

    if (parceiroParam) {
        parceiroNome = decodeURIComponent(parceiroParam);
        document.getElementById('parceiro').value = parceiroNome;

        const parceiroInfo = document.createElement('div');
        parceiroInfo.className = 'parceiro-info';
        parceiroInfo.innerHTML = `<i class="fas fa-handshake"></i> Indicado por: <strong>${parceiroNome}</strong>`;
        document.querySelector('.welcome-message').appendChild(parceiroInfo);

        document.getElementById('indicacao').checked = true;
    }

    $('#telefone').mask('(00) 00000-0000');

    const form = document.getElementById('uniclanForm');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.set('parceiro', parceiroNome);

        submitBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbwhNgKqf9dR4Rp2Donnb_AEHXnwGhx2AurvtBWwW2c-AdfLC2amKaa1n73NGSSYgaG5/exec', {
                method: 'POST',
                body: formData,
            });

            const text = await response.text();

            if (text.toLowerCase().includes('ok')) {
                alert('Cadastro enviado com sucesso!');
                form.reset();
            } else {
                throw new Error('Erro inesperado: ' + text);
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao enviar formulário. Tente novamente.');
        } finally {
            submitBtn.style.display = 'inline-flex';
            loadingSpinner.style.display = 'none';
        }
    });
});
