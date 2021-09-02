import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, SubmitButton, List, ButtonDelete } from "./styles";
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa'

import api from '../../services/api';

export default function Main(){
    const [newRepo, setNewRepo] = useState('');
    const [repositorios, setRepositorios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    //buscar
    useEffect(() => {
        const repoStorage = localStorage.getItem('@repos');

        if(repoStorage){
            setRepositorios(JSON.parse(repoStorage));
        }

    }, []);


    //salvar alterações
    useEffect(()=>{
        localStorage.setItem('@repos', JSON.stringify(repositorios))
    },[repositorios]);


    function handleInputRepo(event) {
       setNewRepo(event.target.value);
       setAlert(null);
    }

    const handleSubmit = useCallback((event)=>{
        event.preventDefault();

        async function submit(){
            setLoading(true);
            setAlert(null);
            try {

                if(newRepo === ''){
                    throw new Error('Você precisa indicar um repositório!');
                }

                const response = await api.get(`repos/${newRepo}`);
                
                const hasRepo = repositorios.find(repo =>repo.name === newRepo );

                if(hasRepo) {
                    setNewRepo('');
                    throw new Error('Repositório duplicado!');
                }
    
                const data = {
                    name: response.data.full_name
                }
    
                setRepositorios([...repositorios, data]);
                setNewRepo('');
            } catch (error) {
                setAlert(true);
                console.log(error);
            }finally{
                setLoading(false);
            }
        }
        
        submit();
    },[newRepo, repositorios]);

    const handleDelete = useCallback((repo) => {
        const find = repositorios.filter(r => r.name !== repo)
        setRepositorios(find);
    }, [repositorios]);

    
    return(
       <Container>
         <h1>
            <FaGithub size={25}/>
            Meus Repositórios
        </h1>

        <Form onSubmit={handleSubmit} error={alert}>
            <input 
                type="text" 
                placeholder="Adicionar Repositórios"
                value={newRepo}
                onChange={handleInputRepo}
            />

            <SubmitButton loading={loading ? 1 : 0}>
                {loading ? 
                    (
                        <FaSpinner color="#FFF" size={14}/>
                    ) : (
                        <FaPlus color="#FFF" size={14}/>
                    )
                }
            </SubmitButton>

        </Form>

        <List>
            {repositorios.map((repositorio) => (
                <li key={repositorio.name}>
                    <span>
                        <ButtonDelete onClick={() => handleDelete(repositorio.name)}>
                            <FaTrash size={14} />
                        </ButtonDelete>
                        {repositorio.name}
                    </span>
                    
                    <Link to={`/repositorio/${encodeURIComponent(repositorio.name)}`}>
                        <FaBars size={20} />
                    </Link>
                </li>
            ))}
        </List>

       </Container>
    );
}