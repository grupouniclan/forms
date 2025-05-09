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

    // Lista de campos obrigatórios
    const CAMPOS_OBRIGATORIOS = [
        { id: 'nome', mensagem: 'Por favor, digite seu nome completo' },
        { id: 'telefone', mensagem: 'Preencha seu telefone completo' },
        { id: 'cidade', mensagem: 'Informe sua cidade' },
        { id: 'email', mensagem: 'Digite um e-mail válido' },
        { 
            tipo: 'radio', 
            name: 'temPlano', 
            mensagem: 'Selecione se possui plano de saúde' 
        },
        { 
            tipo: 'radio', 
            name: 'contatoPreferido', 
            mensagem: 'Escolha como prefere ser contatado' 
        }
    ];

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
        document.getElementById('plano').required = planoSim.checked;
    }

    if (planoSim && planoNao && campoPlano) {
        toggleCampoPlano();
        planoSim.addEventListener('change', toggleCampoPlano);
        planoNao.addEventListener('change', toggleCampoPlano);
    }

    // Sistema de validação
    function validarCampo(elemento) {
        if (elemento.id === 'telefone') {
            return $('#telefone').mask.mask.isComplete();
        }
        return elemento.value.trim() !== '';
    }

    function validarRadio(radios) {
        return Array.from(radios).some(r => r.checked);
    }

    function mostrarErro(elemento, mensagem) {
        elemento.classList.add('campo-invalido');
        const erro = document.createElement('span');
        erro.className = 'erro-validacao';
        erro.textContent = mensagem;
        elemento.parentNode.insertBefore(erro, elemento.nextSibling);
    }

    function mostrarErroRadio(radios, mensagem) {
        const container = radios[0].closest('.form-group');
        container.classList.add('campo-invalido');
        const erro = document.createElement('span');
        erro.className = 'erro-validacao';
        erro.textContent = mensagem;
        container.appendChild(erro);
    }

    function resetarErros() {
        document.querySelectorAll('.campo-invalido').forEach(el => {
            el.classList.remove('campo-invalido');
            const erros = el.querySelectorAll('.erro-validacao');
            erros.forEach(erro => erro.remove());
        });
    }

    function validarFormulario() {
        let valido = true;
        resetarErros();

        CAMPOS_OBRIGATORIOS.forEach(campo => {
            if (campo.tipo === 'radio') {
                const radios = document.getElementsByName(campo.name);
                if (!validarRadio(radios)) {
                    mostrarErroRadio(radios, campo.mensagem);
                    valido = false;
                }
            } else {
                const elemento = document.getElementById(campo.id);
                if (!validarCampo(elemento)) {
                    mostrarErro(elemento, campo.mensagem);
                    valido = false;
                }
            }
        });

        if (planoSim.checked && !document.getElementById('plano').value.trim()) {
            mostrarErro(document.getElementById('plano'), 'Informe o nome do plano atual');
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
                    alert('Você precisa aceitar a política de privacidade!');
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
                    const mensagem = `Oi Grupo Uniclan, meu nome é ${nome.toUpperCase()} e quero saber mais sobre o plano!#Form`;
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