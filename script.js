document.addEventListener('DOMContentLoaded', function () {
    // Configuração inicial do parceiro
    const parceiroParam = new URLSearchParams(window.location.search).get('parceiro');
    const parceiroNome = parceiroParam ? decodeURIComponent(parceiroParam) : 'Anônimo';
    document.getElementById('parceiro').value = parceiroNome;

    // Controle do campo de plano
    const planoSim = document.getElementById('plano-sim');
    const planoNao = document.getElementById('plano-nao');
    const campoPlano = document.getElementById('campo-nome-plano');
    if (planoSim && planoNao) {
        planoSim.addEventListener('change', () => campoPlano.style.display = 'block');
        planoNao.addEventListener('change', () => campoPlano.style.display = 'none');
    }

    // Máscara de telefone
    $('#telefone').mask('(00) 00000-0000');

    // Validação LGPD
    const lgpdCheckbox = document.getElementById('lgpd');
    const submitBtn = document.getElementById('submit-btn');
    if (lgpdCheckbox && submitBtn) {
        submitBtn.disabled = true;
        lgpdCheckbox.addEventListener('change', () => {
            submitBtn.disabled = !lgpdCheckbox.checked;
        });
    }

    // Envio do formulário
    const form = document.getElementById('uniclanForm');
    const spinner = document.getElementById('loading-spinner');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            spinner.style.display = 'block';
            submitBtn.style.display = 'none';
            
            const formData = new FormData(form);
            formData.set('parceiro', parceiroNome);

            // Captura valor do plano
            const temPlano = document.querySelector('input[name="temPlano"]:checked')?.value || 'Não';
            formData.set('temPlano', temPlano);
            if (temPlano === 'Não') formData.set('plano', '');

            try {
                // Envia dados para o Google Sheets
                const response = await fetch('https://script.google.com/macros/s/AKfycbzdOaNdhpGjP-GnqHhPwEOdHnDew-t2ftzEXyauJ--q2tfzDGhES7RAe24BRX1I8LY/exec', {
                    method: 'POST',
                    body: formData,
                });
                
                const result = await response.text();
                console.log('Resposta do servidor:', result);

                if (result.toLowerCase().includes('ok')) {
                    // Prepara e redireciona para o WhatsApp
                    const nome = formData.get('nome');
                    const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!#Form`;
                    const urlZap = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;
                    window.location.href = urlZap;

                    // Reseta o formulário
                    form.reset();
                    if (campoPlano) campoPlano.style.display = 'none';
                    if (lgpdCheckbox) lgpdCheckbox.checked = false;

                } else {
                    alert('Erro no servidor: ' + result);
                }
            } catch (err) {
                console.error('Erro:', err);
                alert('Erro na conexão. Verifique sua internet.');
            } finally {
                spinner.style.display = 'none';
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true;
            }
        });
    }
});
