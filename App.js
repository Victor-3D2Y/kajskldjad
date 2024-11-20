import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Função do Header
function Header() {
    const instagram = "./instagram.webp"
    const twitter = "./twitter.png"
    return (
        <div className='header'>
            <h1>FaculHub – O Curso Certo Para Você</h1>
            <div>
                <img src={instagram} className="imagens" alt="insta" />
                <img src={twitter} className="imagens" alt="twitter" />
            </div>
        </div>
    );
}

// Função do Perfil
function Perfil({ foto, nome, openLoginModal, onLogout, usuarioLogado }) {
    return (
        <div className="perfil">
            {usuarioLogado ? (
                <>
                    <button onClick={onLogout}>Sair</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: 7</p>
                </>
            ) : (
                <>
                    <button onClick={openLoginModal}>Entrar</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: 7</p>
                </>
            )}
        </div>
    );
}

// Função do Postagem
function Postagem({ fotoMain, nomeCurso, instituicao, numInscritos, numComentarios, usuarioLogado, openModal, cursoId, onInscricao }) {
    const [inscrito, setInscrito] = useState(false);
    const [inscritos, setInscritos] = useState(numInscritos);
    const [flecha, setFlecha] = useState("./flecha_cima_vazia.svg");
    const [showComentarioModal, setShowComentarioModal] = useState(false);
    const [comentariosCount, setComentariosCount] = useState(numComentarios); // Contagem de comentários

    const flechaCheia = "./flecha_cima_cheia.svg";
    const flechaVazia = "./flecha_cima_vazia.svg";

    useEffect(() => {
        const checkInscricao = async () => {
            if (usuarioLogado) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/inscricoes/${usuarioLogado.id}/${cursoId}`);
                    if (response.data) {
                        setInscrito(true);
                        setFlecha(flechaCheia);
                    }
                } catch (error) {
                    console.error('Erro ao verificar inscrição:', error);
                }
            }
        };
        checkInscricao();
    }, [usuarioLogado, cursoId]);

    const handleInscricao = async () => {
        if (!usuarioLogado) {
            openModal(); // Abre o modal de login
        } else if (!inscrito) {
            try {
                const response = await axios.post('http://localhost:3001/api/inscricao', {
                    usuario_id: usuarioLogado.id,
                    curso_id: cursoId
                });
                if (response.data.success) {
                    setInscrito(true);
                    setFlecha(flechaCheia);
                    setInscritos(inscritos + 1);
                    onInscricao();
                }
            } catch (error) {
                console.error('Erro ao fazer inscrição:', error);
            }
        } else {
            try {
                const response = await axios.delete(`http://localhost:3001/api/inscricao/${usuarioLogado.id}/${cursoId}`);
                if (response.data.success) {
                    setInscrito(false);
                    setFlecha(flechaVazia);
                    setInscritos(inscritos - 1);
                    onInscricao();
                }
            } catch (error) {
                console.error('Erro ao desinscrever:', error);
            }
        }
    };

    const handleChatClick = () => {
        if (!usuarioLogado) {
            openModal(); // Abre o modal de login se o usuário não estiver logado
        } else {
            setShowComentarioModal(true); // Exibe o modal de comentário
        }
    };

    const closeComentarioModal = () => {
        setShowComentarioModal(false);
    };

    const handleComentarioEnviado = () => {
        setComentariosCount(prev => prev + 1); // Atualiza a contagem de comentários imediatamente
    };

    return (
        <>
            <div className="titlePubli">
                <p>{nomeCurso}</p>
                <p>{instituicao}</p>
            </div>
            <img src={fotoMain} id="eletromecanica" alt="eletromecanica" />
            <div className="flechaChat">
                <div className="leftMain">
                    <img src={flecha} alt="flecha" onClick={handleInscricao} />
                    <p>{inscritos} inscritos</p>
                </div>
                <div className="leftMain">
                    <img src="chat.svg" alt="chat" onClick={handleChatClick} />
                    <p>{comentariosCount} comentários</p> {/* Exibe a contagem atualizada de comentários */}
                </div>
            </div>

            {showComentarioModal && (
                <ComentarioModal
                    cursoId={cursoId}
                    usuarioLogado={usuarioLogado}
                    onComentarioEnviado={handleComentarioEnviado} // Passa a função para atualizar a contagem
                    closeModal={closeComentarioModal}
                />
            )}
        </>
    );
}

function ComentarioModal({ cursoId, usuarioLogado, onComentarioEnviado, closeModal, setNumComentarios }) {
    const [comentario, setComentario] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const handleComentarioChange = (event) => {
        const texto = event.target.value;
        setComentario(texto);

        // Habilita o botão de comentar apenas se o texto não estiver vazio
        setIsButtonDisabled(texto.trim() === '');
    };

    const handleComentar = async () => {
        if (comentario.trim()) {
            try {
                const response = await axios.post('http://localhost:3001/api/comentarios', {
                    usuario_id: usuarioLogado.id,
                    curso_id: cursoId,
                    texto: comentario
                });
                if (response.data.success) {
                    onComentarioEnviado(); // Chama a função para atualizar a lista de comentários
                    setComentario(''); // Limpa a área de texto após comentar
                    setIsButtonDisabled(true); // Desabilita o botão novamente
                    closeModal(); // Fecha o modal de comentário
                    setNumComentarios(prev => prev + 1); // Incrementa a contagem de comentários
                }
            } catch (error) {
                console.error('Erro ao comentar:', error);
            }
        }
    };

    return (
        <div className="comentario-modal">
            <textarea
                value={comentario}
                onChange={handleComentarioChange}
                placeholder="Escreva seu comentário"
            />
            <button
                disabled={isButtonDisabled}
                onClick={handleComentar}
            >
                Comentar
            </button>
            <button onClick={closeModal}>Fechar</button>
        </div>
    );
}




// Função do LoginModal
function LoginModal({ showModal, closeModal, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isInvalid, setIsInvalid] = useState({ email: false, senha: false });

    const handleLogin = async () => {
        setError('');
        setIsInvalid({ email: false, senha: false });

        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, senha });
            if (response.data.success) {
                onLoginSuccess(response.data.user);
                closeModal();
            } else {
                setError('Usuário ou senha incorretos');
                if (!email) setIsInvalid((prev) => ({ ...prev, email: true }));
                if (!senha) setIsInvalid((prev) => ({ ...prev, senha: true }));
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setError('Erro ao fazer login. Tente novamente.');
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isInvalid.email ? 'input-error' : ''}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className={isInvalid.senha ? 'input-error' : ''}
                    />
                </div>
                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                    <button className="enter-btn" onClick={handleLogin}>Entrar</button>
                </div>
            </div>
        </div>
    );
}

// Função Main
function Main({ usuarioLogado, openModal }) {

    const [cursos, setCursos] = useState([]);
    useEffect(() => {
        if (usuarioLogado) {
            const checkInscricoes = async () => {
                for (let curso of cursos) {
                    try {
                        const response = await axios.get(`http://localhost:3001/api/inscricoes/${usuarioLogado.id}/${curso.id_curso}`);
                        if (response.data) {
                            curso.inscrito = true;  // Marca a inscrição no curso
                        } else {
                            curso.inscrito = false;
                        }
                    } catch (error) {
                        console.error('Erro ao verificar inscrição:', error);
                    }
                }
                setCursos([...cursos]);  // Atualiza os cursos com as inscrições
            };
            checkInscricoes();
        }
    }, [usuarioLogado]);  // Re-executa toda vez que o usuário fizer login

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/cursos');
                setCursos(response.data);
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
            }
        };
        fetchCursos();
    }, []);

    const handleInscricao = () => {
        // Aqui, pode-se atualizar a lista de cursos caso necessário
        // Ou realizar outras ações necessárias após a inscrição
        console.log("Curso inscrito!");
    };

    return (
        <div id="tudo">
            <h2>Cursos</h2>
            {cursos.map((curso) => (
                <Postagem
                    key={curso.id_curso}
                    cursoId={curso.id_curso}
                    nomeCurso={curso.nome_curso}
                    fotoMain={curso.foto}
                    instituicao={curso.instituicao}
                    numInscritos={curso.numInscritos}
                    numComentarios={curso.numComentarios}
                    usuarioLogado={usuarioLogado}
                    openModal={openModal}
                    onInscricao={handleInscricao}
                />
            ))}
        </div>
    );
}



function Comentar({ cursoId, usuarioLogado, onComentarioAdicionado }) {
    const [comentario, setComentario] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const handleComentarioChange = (event) => {
        const texto = event.target.value;
        setComentario(texto);

        // Habilita o botão de comentar apenas se o texto não estiver vazio
        if (texto.trim() === '') {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    };

    const handleComentar = async () => {
        if (comentario.trim()) {
            try {
                const response = await axios.post('http://localhost:3001/api/comentarios', {
                    usuario_id: usuarioLogado.id,
                    curso_id: cursoId,
                    texto: comentario
                });
                if (response.data.success) {
                    onComentarioAdicionado(); // Chama a função para atualizar a lista de comentários
                    setComentario(''); // Limpa a área de texto após comentar
                    setIsButtonDisabled(true); // Desabilita o botão novamente
                }
            } catch (error) {
                console.error('Erro ao comentar:', error);
            }
        }
    };

    return (
        <div className="comentar">
            <textarea
                value={comentario}
                onChange={handleComentarioChange}
                placeholder="Escreva seu comentário"
            />
            <button
                disabled={isButtonDisabled}
                onClick={handleComentar}
            >
                Comentar
            </button>
        </div>
    );
}

function ComentarioInput({ cursoId, usuarioLogado, onComentarioEnviado, closeModal }) {
    const [comentario, setComentario] = useState('');
    const [erro, setErro] = useState('');

    const handleComentarioChange = (e) => {
        setComentario(e.target.value);
    };

    const handleComentarioSubmit = async () => {
        if (!comentario) {
            setErro('Por favor, digite um comentário.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/comentario', {
                curso_id: cursoId,
                usuario_id: usuarioLogado.id,
                texto: comentario
            });

            if (response.data.success) {
                onComentarioEnviado(); // Atualiza a publicação com o novo comentário
                closeModal(); // Fecha o modal de comentário
            } else {
                setErro('Erro ao enviar comentário.');
            }
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            setErro('Erro ao enviar comentário. Tente novamente.');
        }
    };

    return (
        <div className="comentario-input">
            <textarea
                placeholder="Digite seu comentário..."
                value={comentario}
                onChange={handleComentarioChange}
            />
            {erro && <p className="error-message">{erro}</p>}
            <div>
                <button onClick={closeModal}>Cancelar</button>
                <button onClick={handleComentarioSubmit}>Enviar</button>
            </div>
        </div>
    );
}





// Função principal App.js
function App() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [empresa, setEmpresa] = useState(null);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    const handleLoginSuccess = (user) => {
        setUsuarioLogado(user);
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        window.location.reload();
    };

    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/empresa');
                setEmpresa(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados da empresa:', error);
            }
        };
        fetchEmpresa();
    }, []);

    useEffect(() => {
        if (usuarioLogado) {
            const fetchFotoUsuario = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/usuarios/${usuarioLogado.id}`);
                    setUsuarioLogado((prev) => ({ ...prev, foto: response.data.foto }));
                } catch (error) {
                    console.error('Erro ao buscar foto do usuário:', error);
                }
            };
            fetchFotoUsuario();
        }
    }, [usuarioLogado]);

    return (
        <div className="App">
            <Header />
            <div id="principal">
                <Perfil
                    foto={usuarioLogado && usuarioLogado.foto ? usuarioLogado.foto : empresa ? empresa.logo : "default_logo.png"}
                    nome={usuarioLogado ? usuarioLogado.nome : empresa ? empresa.nome : "FaculHub"}
                    openLoginModal={openModal}
                    onLogout={handleLogout}
                    usuarioLogado={usuarioLogado}
                />
                <Main usuarioLogado={usuarioLogado} openModal={openModal} />
                <LoginModal
                    showModal={isModalVisible}
                    closeModal={closeModal}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        </div>
    );
}

export default App;