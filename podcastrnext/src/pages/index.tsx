// 3 Formas de fazer consume de uma API: 
/* 1 - SPA Single page application 

import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    fetch('http://localhost:3333/episodes')
    .then(response => response.json())
    .then(data => console.log(data))
  }, [])
  return (
    <h1>Index</h1>
  )
}
// Não aparece para os mecanismos de busca o html.
// Não funciona sem o JS habilitado na page 
*/
/* 2 - SSR Server side rendering 

export default function Home(props) {
  return (
    <div>
    <h1>Index</h1>
    <p>{JSON.stringify(props.episodes)}</p>
    </div>
  )
}

export async function getServerSideProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data,
    }
  }
}

*/
// 3 - SSG Static site generation
// Gera uma versão estática da página, sem precisar fazer uma nova requisição para cada acesso
// Torna a página mais ágil. 
// Só funciona em produção por isso se faz necessário gerar uma build para o projeto, para simular produção.
// Para isso yarn build 


export default function Home(props) {
  return (
    <div>
      <h1>Index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </div>
  )
}
// Unica alteração no código em relação ao SSR,
// é a troca do getServerSideProps() por getStaticProps().
export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8 // Prazo em que sera gerado uma nova chamada API 
  }
}