export type RecordKey =
  | 'album-1'
  | 'album-2'
  | 'album-3'
  | 'album-4'
  | 'album-5'
  | 'mule-covering-ground'
  | 'mule-the-thaw';

export interface Album {
  key: RecordKey;
  name: string;
  title: string;
  // Full-size sleeve, used for the schema.
  cover: string;
  // 320px square of the sleeve: film strip, record label and blurred backdrop.
  art: string;
  // Image for the disc's centre label, if different from `art`.
  label?: string;
  audio: string;
  // Running time as printed, e.g. "32:36".
  length: string;
  // Colour the room takes while this record plays.
  tint: string;
  // Mule singles: 7-inch coloured vinyl at 45 rpm. TRF albums: black 12-inch LPs at 33⅓.
  single?: boolean;
  vinyl?: string;
}

export const ALBUMS: Album[] = [
  {
    key: 'album-1',
    name: 'I',
    title: 'Those Rambling Fools',
    cover: '/covers/album1new.webp',
    art: '/covers/album1-320.webp',
    audio: '/covers/album1.mp3',
    length: '32:36',
    tint: '#c49a62',
  },
  {
    key: 'album-2',
    name: 'II',
    title: 'II',
    cover: '/covers/album2new.webp',
    art: '/covers/album2-320.webp',
    audio: '/covers/album2.mp3',
    length: '31:34',
    tint: '#c2ad5f',
  },
  {
    key: 'album-3',
    name: 'III',
    title: 'III',
    cover: '/covers/album3.webp',
    art: '/covers/album3-320.webp',
    label: '/covers/album3alt-320.webp',
    audio: '/covers/album3.mp3',
    length: '33:20',
    tint: '#e2ddd2',
  },
  {
    key: 'album-4',
    name: 'IV',
    title: '4',
    cover: '/covers/album4.webp',
    art: '/covers/album4-320.webp',
    audio: '/covers/album4.mp3',
    length: '30:30',
    tint: '#8fb6e6',
  },
  {
    key: 'album-5',
    name: 'V',
    title: 'Five',
    cover: '/covers/album5.webp',
    art: '/covers/album5-320.webp',
    audio: '/covers/album5.mp3',
    length: '28:10',
    tint: '#d0603f',
  },
];

// Mule: Christos P.'s solo project.
export const MULE_LINKS = {
  instagram: 'https://www.instagram.com/mule_musicproject/',
  youtube: 'https://www.youtube.com/channel/UCRNAS71jPSSsrsosjnD9SjQ',
};

export const SINGLES: Album[] = [
  {
    key: 'mule-covering-ground',
    name: 'A',
    title: 'Covering Ground',
    cover: '/covers/mule-covering-ground.webp',
    art: '/covers/mule-covering-ground-320.webp',
    audio: '/covers/mule-covering-ground.mp3',
    length: '2:47',
    tint: '#d9803e',
    single: true,
    vinyl: 'radial-gradient(circle at 38% 32%, #c76a3e, #6a2414 72%)',
  },
  {
    key: 'mule-the-thaw',
    name: 'B',
    title: 'The Thaw',
    cover: '/covers/mule-the-thaw.webp',
    art: '/covers/mule-the-thaw-320.webp',
    audio: '/covers/mule-the-thaw.mp3',
    length: '2:48',
    tint: '#a6b35a',
    single: true,
    vinyl: 'radial-gradient(circle at 38% 32%, #93a24c, #33401a 72%)',
  },
];
