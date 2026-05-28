export type AlbumKey = 'album-1' | 'album-2' | 'album-3' | 'album-4';

export interface Album {
  key: AlbumKey;
  name: string;
  title: string;
  cover: string;
  audio: string;
}

export const ALBUMS: Album[] = [
  {
    key: 'album-1',
    name: 'I',
    title: 'Those Rambling Fools',
    cover: '/covers/album1new.webp',
    audio: '/covers/album1.mp3',
  },
  {
    key: 'album-2',
    name: 'II',
    title: 'II',
    cover: '/covers/album2new.webp',
    audio: '/covers/album2.mp3',
  },
  {
    key: 'album-3',
    name: 'III',
    title: 'III',
    cover: '/covers/album3.webp',
    audio: '/covers/album3.mp3',
  },
  {
    key: 'album-4',
    name: 'IV',
    title: '4',
    cover: '/covers/album4.webp',
    audio: '/covers/album4.mp3',
  },
];
