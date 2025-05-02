document.addEventListener('DOMContentLoaded', function () {
    // Captura do parceiro na URL
    const parceiroParam = new URLSearchParams(window.location.search).get('parceiro');
    const parceiroNome = parceiroParam ? decodeURIComponent(parceiroParam) : 'Anônimo';
    document.getElementById('parceiro').value = parceiroNome;

    // Controle do campo de plano
    const planoSim = document.getElementById('plano-sim');
    const planoNao = document.getElementById('plano-nao');
    const campoPlano = document.getElementById('campo-nome-plano');
    planoSim?.addEventListener('change', () => campoPlano.style.display = 'block');
    planoNao?.addEventListener('change', () => campoPlano.style.display = 'none');

    // Conversão automática para MAIÚSCULAS
    document.querySelectorAll('input[type="text"], textarea').forEach(el => {
        el.style.textTransform = 'uppercase';
        el.addEventListener('input', () => el.value = el.value.toUpperCase());
    });

    // Máscara de telefone
    $('#telefone').mask('(00) 00000-0000');

    // Validação LGPD
    const lgpdCheckbox = document.getElementById('lgpd');
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    lgpdCheckbox.addEventListener('change', () => {
        submitBtn.disabled = !lgpdCheckbox.checked;
    });

    // Envio do formulário
    const form = document.getElementById('uniclanForm');
    const spinner = document.getElementById('loading-spinner');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        spinner.style.display = 'block';
        submitBtn.style.display = 'none';
        
        const formData = new FormData(form);
        formData.set('parceiro', parceiroNome);

        // Captura o valor do plano (SIM/NÃO)
        const temPlano = document.querySelector('input[name="temPlano"]:checked')?.value || 'Não';
        formData.set('temPlano', temPlano);

        // Limpa o campo "plano" se for "Não"
        if (temPlano === 'Não') {
            formData.set('plano', '');
        }

        try {
            // Envia dados para o Google Sheets
            const response = await fetch('https://script.google.com/macros/s/AKfycbzdOaNdhpGjP-GnqHhPwEOdHnDew-t2ftzEXyauJ--q2tfzDGhES7RAe24BRX1I8LY/exec', {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.text();
            console.log('Resposta do servidor:', result);

            if (result.toLowerCase().includes('ok')) {
                const nome = form.get('nome');
                const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!`;
                const urlZap = `https://wa.me/551433022681?text=${encodeURIComponent(mensagem)}`;

                // Referências dos modais
                const whatsappModal = document.getElementById('whatsappModal');
                const obrigadoModal = document.getElementById('obrigadoModal');

                if (whatsappModal && obrigadoModal) {
                    whatsappModal.style.display = 'flex';

                    document.getElementById('modalSim').onclick = () => {
                        whatsappModal.style.display = 'none';
                        window.location.href = urlZap;
                    };

                    document.getElementById('modalNao').onclick = () => {
                        whatsappModal.style.display = 'none';
                        obrigadoModal.style.display = 'flex';
                    };
                }

                // Reset do formulário
                form.reset();
                campoPlano.style.display = 'none';
                lgpdCheckbox.checked = false;
            } else {
                alert('Erro no servidor: ' + result);
            }
        } catch (err) {
            console.error('Erro completo:', err);
            alert('Falha na conexão. Verifique sua internet e tente novamente.');
        } finally {
            spinner.style.display = 'none';
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = true;
        }
    });
});