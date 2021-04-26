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
import { GetStaticProps } from 'next';
import Image from 'next/image';  // componente do next que formata automaticamente a imagem para a page 
import Head from 'next/head';
import Link from 'next/link'; // usado para que somente esta parte da página seja carregada enquanto o que não se modifica fica estático tornando a page mais ágil
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { usePlayer } from '../contexts/PlayerContext';

import styles from './home.module.scss';

// sempre que adicionar uma estrutura de repetição .map no react, precisa se adicionar uma propriedade key no primeiro elemento do return dentro do map com a informação unica que existe em cada episódio (ID) ex:   <li key={episode.id}> 

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
  //... server.json
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit='cover'
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar Episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
// Unica alteração no código em relação ao SSR, é a troca do getServerSideProps() por getStaticProps().
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {// '?_limit=12&_sort=published_at&_order=desc' => sintaxe mais simples dos parâmetros usando API.ts
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  //os dados a cima estão vindo da api 
  // abaixo estou formatando os dados  dos 12 podcasts, recebidos pela api e apresentados na home

  const episodes = data.map(episodes => {
    return {
      id: episodes.id,
      title: episodes.title,
      thumbnail: episodes.thumbnail,
      members: episodes.members,
      publishedAt: format(parseISO(episodes.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episodes.file.duration),
      durationAsString: convertDurationToTimeString(Number(episodes.file.duration)),
      url: episodes.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8 // Prazo em que sera gerado uma nova chamada API 
  }
}