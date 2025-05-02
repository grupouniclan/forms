
document.addEventListener('DOMContentLoaded', function () {
    const parceiroParam = new URLSearchParams(window.location.search).get('parceiro');
    const parceiroNome = parceiroParam ? decodeURIComponent(parceiroParam) : 'Anônimo';
    document.getElementById('parceiro').value = parceiroNome;

    const planoSim = document.getElementById('plano-sim');
    const planoNao = document.getElementById('plano-nao');
    const campoPlano = document.getElementById('campo-nome-plano');
    planoSim?.addEventListener('change', () => campoPlano.style.display = 'block');
    planoNao?.addEventListener('change', () => campoPlano.style.display = 'none');

    document.querySelectorAll('input[type="text"], textarea').forEach(el => {
        el.style.textTransform = 'uppercase';
        el.addEventListener('input', () => el.value = el.value.toUpperCase());
    });
    $('#telefone').mask('(00) 00000-0000');
    const lgpdCheckbox = document.getElementById('lgpd');
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    lgpdCheckbox.addEventListener('change', () => {
        submitBtn.disabled = !lgpdCheckbox.checked;
    });

    const form = document.getElementById('uniclanForm');
    const spinner = document.getElementById('loading-spinner');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        spinner.style.display = 'block';
        submitBtn.style.display = 'none';
        const formData = new FormData(form);
        formData.set('parceiro', parceiroNome);

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbxgAU2MwTm0TAGP0_2gBMVf_4_N8pfbZLyzbHLlDuN7oyEfyTYwpHd-NYFCwH5fs82S/exec', {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            if (result.toLowerCase().includes('ok')) {
                const nome = form.get('nome');
                const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!`;
                const urlZap = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;
                if (confirm("Cadastro enviado com sucesso! Deseja falar com a equipe via WhatsApp?")) {
                    window.location.href = urlZap;
                } else {
                    alert("Obrigado! Em breve entraremos em contato.");
                }
                form.reset();
                campoPlano.style.display = 'none';
            } else {
                alert("Erro inesperado: " + result);
            }
        } catch (err) {
            alert("Erro ao enviar. Tente novamente.");
        } finally {
            spinner.style.display = 'none';
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = true;
        }
    });
});
