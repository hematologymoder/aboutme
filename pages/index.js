import { useState, useRef, useEffect } from 'react';
import interact from 'interactjs';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="system-stat">
        {time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        })}
      </div>
      <div className="system-stat">
        {time.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })}
      </div>
    </>
  );
};

//
// ─── WINDOW DRAGGABLE WRAPPER ────────────────────────────────────────────────────
//
const Window = ({ title, children, style, onActivate }) => {
  const windowRef = useRef(null);

  useEffect(() => {
    const element = windowRef.current;
    if (!element) return;


    const position = {
      x: parseInt(style.left, 10) || 0,
      y: parseInt(style.top, 10) || 0
    };


    element.style.position = 'absolute';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;


    const dragInstance = interact(element).draggable({
      allowFrom: '.window-header',
      inertia: false,
      listeners: {
        move(event) {
          const containerRect = document
            .querySelector('.windows-container')
            .getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();


          position.x += event.dx;
          position.y += event.dy;


          position.x = Math.max(
            0,
            Math.min(position.x, containerRect.width - elementRect.width)
          );
          position.y = Math.max(
            0,
            Math.min(position.y, containerRect.height - elementRect.height)
          );


          element.style.left = `${position.x}px`;
          element.style.top = `${position.y}px`;


          element.style.boxShadow = '0 8px 32px rgba(183, 157, 203, 0.3)';
        },
        end() {

          element.style.boxShadow = '';
        }
      }
    });

    return () => {
      dragInstance.unset();
    };
  }, [style.left, style.top]);

  const handleWindowClick = (e) => {
    // stop lookjng through my shitty code
    if (!e.target.closest('.window-header') || !e.target.closest('.window-buttons')) {
      onActivate && onActivate();
    }
  };

  return (
    <div
      ref={windowRef}
      className="draggable-box"
      style={{
        ...style,
        position: 'absolute',
        touchAction: 'none',
        transition: 'box-shadow 0.2s ease, border 0.2s ease'
      }}
      onClick={handleWindowClick}
    >
      <div className="window-header">
        <div className="window-buttons">
          <button className="window-button window-close" />
          <button className="window-button window-minimize" />
          <button className="window-button window-maximize" />
        </div>
        <span className="window-title">{title}</span>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
};

//feed back thing
const FeedbackModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (res.ok) {
        setStatus('Thank you for your feedback! ✨');
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => {
          onClose();
          setStatus('');
        }, 2000);
      } else {
        setStatus('Failed to send feedback 😢');
      }
    } catch (error) {
      setStatus('Error sending feedback');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl mb-4 font-medium text-gray-800">✨ feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-pink-200 rounded focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-pink-200 rounded focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <textarea
              placeholder="your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-2 border border-pink-200 rounded h-32 focus:outline-none focus:border-pink-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-pink-100 hover:bg-pink-200 rounded transition-colors"
          >
            send feedback ✨
          </button>
          {status && (
            <div className="text-center text-sm text-gray-600 mt-2">
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};


// file system
const initialFileSystem = {
  home: {
    type: 'directory',
    contents: {
      'about.txt':
        "hey! im emily (aka hematologymoder), a 15 yr old developer from san francisco. currently a freshman in high school! ",
      'contact.txt':
        'check the contact card on this page!',
      'projects/': { type: 'directory', contents: {} },
      'interests/': { type: 'directory', contents: {} },
      'skills/': { type: 'directory', contents: {} },
      'favorites/': { type: 'directory', contents: {} },
      'misc/': { type: 'directory', contents: {} },
    },
  },
  skills: {
    type: 'directory',
    contents: {
      'cloud.txt':
        'aws certified in:\n- cloud practitioner\n- developer\n\ncomfortable with ec2, s3, lambda, and more!',
      'frontend.txt': 'next.js, react, typescript, tailwind, ',
      'backend.txt': 'python, flask, django, postgresql ',
      'devops.txt':
        'git, docker, kubernetes, github actions, mostly self host with aws or digital ocean though',
      'editor.txt':
        'neovim user btw, death to all AI IDEs',
    },
  },
  projects: {
    type: 'directory',
    contents: {
      'untitled notes app':
        'i dont really have a name for this but its a project im working on to make from textbooks easier cause its a pain in the ass to make flashcards and everything that already exists sucks',
      'cont.txt':
        'conceptual translation tool, working on it with a friend of mine',
    },
  },
  interests: {
    type: 'directory',
    contents: {
      'hematology.txt':
        "currently reading 'hoffbrand's essential haematology'! hoping to study hematology or endocrinology in college",
      'endocrinology.txt':
        "currently reading 'harrison's endocrinology' by j. larry jameson!",
      'programming.txt':
        "i do a lot of it, but i dont plan on majoring in it in college, its just fun",
    },
  },
  favorites: {
    type: 'directory',
    contents: {
      'tv-shows.txt':
        'my favorite shows:\n- silo\n- severance\n- house md\n- (im aware that all of those are malebrained)',
      'programming.txt':
        'my favorite programming languages:\n- python\n- typescript\n- swift',
      'songs.txt':
        'favorite artists:\n- laufey\n- clairo\n- mitski\n- sabrina carpenter\n- beabadoobee',
      'video-games.txt':
        'dont play many, but i liked subnautica!',
    },
  },
  misc: {
    type: 'directory',
    contents: {
      'readme.txt':
        'this folder is for miscellaneous stuff - more coming soon!',
      'socials.txt':
        'twitter: @hematologymoder\npriv twitter is @endocrinemoder',
      'politics.txt':
        'im a socialist. nothing more to say',
      'stack.txt':
        'my stack is next.js + typescript + tailwind + trpc + supabase',
    },
  },
};

const secretCommands = {
  hematologymoder:
    "hematologymoder is my username because i love studying blood disorders! check out my reading list :)",
  neovim: "check out my config! https://github.com/hematologymoder/nvim.git",
  nvim: "check out my config! https://github.com/hematologymoder/nvim.git",
  blood:
    "im very interested in hematology and blood disorders. try 'cat hematology.txt' in the interests directory",
  hormones:
    "check out 'cat endocrinology.txt' in the interests directory",
  ping: "pong!",
  secret: "theres some cool stuff here",
  sudo: 'nice try :)',
  rf: '🚨 NOPE! 🚨',
  rm: 'come on',
  repo: 'check out the repository: https://github.com/hematologymoder/aboutme',
  calc: (expr) => {
    try {
      return eval(expr);
    } catch {
      return 'Invalid expression';
    }
  },
};

function Terminal() {
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [currentDir, setCurrentDir] = useState('home');
  const [terminalOutput, setTerminalOutput] = useState(
    "run 'help' to start (you can move the windows around btw)"
  );
  const [userCommand, setUserCommand] = useState('');

  const containerRef = useRef(null);

  // clear whenever user runs (i tried to make this better but im lazy)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userCommand.trim()) return;
    const newOutput = runCommand(userCommand.trim());
    setTerminalOutput(newOutput);
    setUserCommand('');
  };

  function runCommand(cmdString) {
    const [cmdName, ...rest] = cmdString.split(' ');
    const argString = rest.join(' ');

    // 1) secret commands :)
    if (secretCommands[cmdName]) {
      const val = secretCommands[cmdName];
      if (typeof val === 'function') {
        const result = val(argString);
        return `~/${currentDir} $ ${cmdString}\n${result}`;
      } else {
        return `~/${currentDir} $ ${cmdString}\n${val}`;
      }
    }

    // 2) main commands
    switch (cmdName.toLowerCase()) {
      case 'ls':
        return listContents(cmdString);
      case 'cd':
        return changeDirectory(argString);
      case 'cat':
        return readFile(argString);
      case 'mkdir':
        return makeDirectory(argString);
      case 'pwd':
        return `~/${currentDir} $ ${cmdString}\n${currentDir}`;
      case 'clear':
        return '';
      case 'help':
        return showHelp(cmdString);
      case 'tree':
        return `~/${currentDir} $ ${cmdString}\n.\n${tree(currentDir)}`;
      case 'nvim':
        return `~/${currentDir} $ ${cmdString}\n(placeholder: nvim is not fully interactive in this React version)`;
      case 'theme':
        return `~/${currentDir} $ ${cmdString}\n(switching theme is not implemented in this snippet)`;
      case 'spotify':
      case 'github':
      case 'weather':
      case 'news':
      case 'quote':
        return `~/${currentDir} $ ${cmdString}\n(placeholder: no real fetch in this snippet)`;
      default:
        return `~/${currentDir} $ ${cmdString}\ncommand not found. type 'help'`;
    }
  }

  function listContents(cmdString) {
    const dirObj = fileSystem[currentDir];
    if (!dirObj || dirObj.type !== 'directory') {
      return `~/${currentDir} $ ${cmdString}\nDirectory not found: ${currentDir}`;
    }
    const items = Object.keys(dirObj.contents);
    return `~/${currentDir} $ ${cmdString}\n${items.join('  ')}`;
  }

  function changeDirectory(arg) {
    if (!arg) {
      return `~/${currentDir} $ cd\nUsage: cd <directory>`;
    }
    if (arg === '..') {
      setCurrentDir('home');
      return `~/${currentDir} $ cd ..\n${'home'}`;
    }
    const obj = fileSystem[arg] ?? null;
    if (obj && obj.type === 'directory') {
      setCurrentDir(arg);
      return `~/${currentDir} $ cd ${arg}\nNow in ${arg}`;
    } else {
      return `~/${currentDir} $ cd ${arg}\nDirectory not found: ${arg}`;
    }
  }

  function readFile(arg) {
    if (!arg) {
      return `~/${currentDir} $ cat\nUsage: cat <filename>`;
    }
    const dirObj = fileSystem[currentDir];
    if (!dirObj || dirObj.type !== 'directory') {
      return `~/${currentDir} $ cat ${arg}\nNo such directory: ${currentDir}`;
    }
    const fileData = dirObj.contents[arg];
    if (!fileData || fileData.type === 'directory') {
      return `~/${currentDir} $ cat ${arg}\nFile not found: ${arg}`;
    }
    return `~/${currentDir} $ cat ${arg}\n${fileData}`;
  }

  function makeDirectory(arg) {
    if (!arg) {
      return `~/${currentDir} $ mkdir\nUsage: mkdir <dirname>`;
    }
    // hiiiiiiii 
    const dirObj = fileSystem[currentDir];
    if (!dirObj || dirObj.type !== 'directory') {
      return `~/${currentDir} $ mkdir ${arg}\nCan't create inside non-directory ${currentDir}`;
    }
    if (dirObj.contents[arg]) {
      return `~/${currentDir} $ mkdir ${arg}\nDirectory or file already exists: ${arg}`;
    }
    const newFs = { ...fileSystem };
    newFs[currentDir] = { ...newFs[currentDir] };
    newFs[currentDir].contents = { ...newFs[currentDir].contents };
    newFs[currentDir].contents[arg] = { type: 'directory', contents: {} };
    setFileSystem(newFs);
    return `~/${currentDir} $ mkdir ${arg}\nCreated directory: ${arg}`;
  }

  function showHelp(cmdString) {
    const helpText = `available commands:
- ls: list directory contents
- cd: change directory
- cat: view file
- mkdir: create directory
- clear: clear screen
- theme: placeholder
- help: show this help
- repo: link to the repository
- tree: show a tree of directories
`;
    return `~/${currentDir} $ ${cmdString}\n${helpText}`;
  }

  function tree(dir, prefix = '', depth = 0) {
    const dirObj = fileSystem[dir];
    if (!dirObj || dirObj.type !== 'directory') return '';
    const entries = Object.entries(dirObj.contents);

    return entries
      .map(([name, obj], idx) => {
        const isLast = idx === entries.length - 1;
        const linePrefix = prefix + (isLast ? '└── ' : '├── ');
        let result = linePrefix + name + '\n';
        if (obj.type === 'directory') {
          const subPrefix = prefix + (isLast ? '    ' : '│   ');
          result += tree(name.replace('/', ''), subPrefix, depth + 1);
        }
        return result;
      })
      .join('');
  }

  // stop looking through my shitty code
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [terminalOutput]);

  return (
    <div className="flex flex-col w-full h-full bg-pastelPink text-gray-800 font-mono border border-pink-300">
      {/* output (fixed to only show most recent output) */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-hidden"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {terminalOutput}
      </div>

      {/* fuck this stupid shit i tried to make this work for like an hour yesterday */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center border-t border-pink-300 p-2"
      >
        <span className="mr-2">$</span>
        <input
          type="text"
          className="flex-grow bg-transparent text-gray-800 outline-none placeholder-gray-500"
          placeholder="Type a command..."
          value={userCommand}
          onChange={(e) => setUserCommand(e.target.value)}
          onBlur={(e) => {
            // keep focus on user input
            e.target.focus();
          }}
        />
      </form>
    </div>
  );
}

// stopppppp looking through this ik its shit
const LastFM = ({ currentTrack }) => {
  if (!currentTrack) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-sm text-gray-500">
        Loading Last.fm data...
      </div>
    );
  }
  if (currentTrack.tracks && Array.isArray(currentTrack.tracks) && currentTrack.tracks.length > 0) {
    const nowPlaying = currentTrack.tracks.find(track => track.isPlaying) || currentTrack.tracks[0];
    const recentTracks = currentTrack.tracks.filter(track => !track.isPlaying).slice(0, 5);

    return (
      <div className="p-4 h-full">
        <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
        <div className="flex items-center">
          <img
            src={nowPlaying.coverArt}
            alt="Album Cover"
            className="w-24 h-24 rounded-lg shadow-lg mr-4"
          />
          <div>
            <h4 className="text-xl font-semibold underline">
              <a href={`https://www.last.fm/music/${encodeURIComponent(nowPlaying.artist)}/_/${encodeURIComponent(nowPlaying.title)}`} target="_blank" rel="noopener noreferrer">
                {nowPlaying.title}
              </a>
            </h4>
            <p className="text-sm text-gray-600">by {nowPlaying.artist}</p>
            {nowPlaying.album && nowPlaying.album.trim().toLowerCase() !== nowPlaying.title.trim().toLowerCase() && (
              <p className="text-xs text-gray-500">from {nowPlaying.album}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Recently Played</h4>
          <ul className="space-y-1">
            {recentTracks.map((track, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{index + 1}.</span>
                {track.coverArt && (
                  <img src={track.coverArt} alt="Cover Thumbnail" className="w-8 h-8 rounded" />
                )}
                <div>
                  <span className="text-sm font-medium underline">
                    <a href={`https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.title)}`} target="_blank" rel="noopener noreferrer">
                      {track.title}
                    </a>
                  </span>
                  <span className="ml-2 text-xs text-gray-400">by {track.artist}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else {
    const track = currentTrack.track || currentTrack;
    return (
      <div className="p-4 h-full">
        {track && track.name ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              {track.image && (
                <img
                  src={track.image}
                  alt="Album Art"
                  className="w-16 h-16 rounded-lg shadow-sm"
                />
              )}
              <div>
                <h3 className="font-medium text-sm underline">
                  <a href={`https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.title)}`} target="_blank" rel="noopener noreferrer">
                    {track.title}
                  </a>
                </h3>
                <p className="text-sm text-gray-600">by {track.artist}</p>
                <p className="text-xs text-gray-500">{track.album}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No track playing
          </div>
        )}
      </div>
    );
  }
};


export default function Home() {
  const [confession, setConfession] = useState('');
  const [smsStatus, setSmsStatus] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [twitterData, setTwitterData] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [favorites, setFavorites] = useState({
    books: `KEY:
✓ = Read
☐ = Unread

MEDICAL
  Endocrinology
    Advanced
      ✓ "Endocrinology: Basic and Clinical Principles" by Shlomo Melmed and P. Michael Conn
      ☐ "Greenspan's Basic and Clinical Endocrinology" by David Gardner and Dolores Shoback
      ✓ "The Endocrine System at a Glance" by Ben Greenstein and Diana Wood
      ☐ "Harrison's Endocrinology" by J. Larry Jameson
    
    Basics
      ☐ "Endocrinology: An Integrated Approach" by Stephen Nussey and Saffron Whitehead
      ☐ "The Endocrine System: An Overview" by Lorrie Klosterman (NOT ON AA)
      ✓ "Illustrated Review of Endocrinology" by William F. Young Jr.
      ✓ "Endocrine Physiology" by Patricia E. Molina

  Hematology
    Basics
      ✓ "Essentials of Hematology" by Shirish M Kawthalkar
      ✓ "Hematology: A Pathophysiologic Approach" by Charles Richard Howard
      ☐ "Hematology in Clinical Practice" by Robert Hillman, Kenneth Ault, and Henry Rinder
      ☐ "Clinical Hematology Atlas" by Bernadette Rodak and Jacqueline Carr

    Advanced
      ☐ "Williams Hematology" by Kenneth Kaushansky et al.
      ☐ "Hoffbrand's Essential Haematology" by Victor Hoffbrand and Paul Moss
      ☐ "Atlas of Hematology" by Shauna Anderson and Keila Pauline

  Psychology
    ✓ DSM-5
    ✓ DSM-5-TR: Clinical Cases

ENGINEERING
  General
    ✓ "The Art of Doing Science and Engineering"

  Networks
    ✓ "TCP/IP Illustrated: The Implementation"

  Machine Learning
    ☐ "Pattern Recognition and Machine Learning"
    ☐ "Hands-On Machine Learning with Scikit-Learn, Keras, and TesorFlow"
    ☐ "Designing Machine Learning Systems"
    ☐ "Machine Learning Engineering"
    ✓ "Reinforcement Learning: An Introduction"

REALPOLITIK
  Marx
    Capital
      ✓ Vol 1
      ✓ Vol 2
      ☐ Vol 3

    Other
      ✓ The Communist Manifesto
      ☐ The German Ideology
      ☐ The Poverty of Philosophy
      ✓ The Economic and Philosophic Manuscripts of 1844
      ✓ Value, Price, and Profit (SPEECH)
      ☐ Wage-Labor and Capital (LECTURE)

  Lenin
    ✓ The State and Revolution
    ✓ Imperialism: The Highest Stage of Capitalism
    ✓ What is to be done?
    ☐ "Left-Wing" Communism: an Infantile Disorder
    ✓ On Cooperation
    ☐ The Proletarian Revolution and the Renegade Kautsky
    ☐ The Right of Nations to Self-Determination

  Trotsky
    ☐ The Defense of Terrorism
    ✓ In Defense of Marxism
    ✓ The Permanent Revolution
    ✓ Our Revolution
    ☐ If America Should Go Communist
    ✓ 1905
    ☐ Lessons of October
    ✓ Fascism: What it is and how to fight it
    ☐ The Death Agony of Capitalism and the Tasks of the Fourth International

  Luxemburg
    ✓ The Accumulation of Capital
    ✓ Reform or Revolution
    ☐ Social Reform or Revolution
    ✓ Leninism or Marxism?
    ☐ Order Reigns in Berlin
    ✓ The Russian Revolution

  Libslop
    ✓ The Origins of Political Order by Francis Fukuyama
    ✓ Political Order and Political Decay by Francis Fukuyama
    ✓ Capital by Thomas Piketty
    ✓ It's OK to be Angry About Capitalism by Bernie Sanders (my grandparents bought this for me)

  Other
    ☐ Socialism: Utopian and Scientific

OTHER
  ✓ Debt: The First 5,000 Years by David Graeber
  ✓ Reconstruction by Eric Foner
  ✓ Principles of Macroeconomics 3e`,
    aboutMe: 'hi!!!! my name is emily and im really interested in hematology and endocrinology! i also trade stocks and do webdev on the side. i live in sf, and im not going to say where i go to high school. im trying to be a bit more optimistic about my transition, but i think im going to pass at some point, just have to give it time, im (sadly) boymoding right now so i havent socially transitioned yet. im not going to update this section, so if you want current information about me, check out my twitter @hematologymoder! i started blockers and hrt at late fourteen and late tanner stage three. im going to have some photos of myself on my twitter soon, just not yet. im about 5 feet 9 inches tall (😔) but hopefully hrt will decrease that. theres a lot more info about me all around this site, so im going to let you explore it instead of boring u to death with this text box. have fun! ',
    shows: 'favorite shows:\n- severance\n- succession\n- silo\n- house md \n- favorite movies: ',
    movies: 'ive used a lot of brokerages in the past, but i really like public the most! i mostly trade biotech/pharma securites and get info from biopharmcatalyst.com! i usually read the financial times for info about markets. its a bit expensive but the journalism is really good. i also read propublica and the new york times for us politics and the sf chronicle for news about sf',
    about: `YOU CAN DRAG THE WINDOWS AROUND

tech stack:
- next.js
- tailwindcss (styling)
- hosted with a digitalocean droplet
- Node.js backend for API routes
- ik its overcomplicated but i like it
features:
- draggable windows (using interact.js)
- real-time Last.fm integration
- Twitter feed integration
- photo slideshow
- custom OS-style UI (built like macos)

this site was built as a fun personal project to showcase:
- my interests (medical books, music, photos)
- my aesthetic preferences (pink/pastel colors)
- my development skills (React, APIs, UI design)

open source and available on github soon

made by emily
`
  });

  // static system stats (tried to get dynamic to work and it suckedddd)
  const systemStats = {
    cpu: '8.42',
    ram: '36',
    battery: '73'
  };

  // photo array (only one of these is used lmao)
  const photos = [
    '/photos/photo1.jpeg',
    '/photos/photo4.jpeg',
    '/photos/photo5.jpeg',
    '/photos/photo6.jpeg',
    '/photos/photo7.jpeg',
    '/photos/photo8.jpeg',
    '/photos/photo9.jpeg',
    '/photos/photo11.jpeg'
  ];

  // shuffle photos 
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // shuffle photos on first open (doesnt matter cause its literally only one rnnnnnnn ijbollllll)
  const [shuffledPhotos, setShuffledPhotos] = useState(() => shuffleArray([...photos]));

  const PhotoSlideshow = () => {
    const nextPhoto = () => {
      setCurrentPhotoIndex((prevIndex) => {
        const newIndex = prevIndex === shuffledPhotos.length - 1 ? 0 : prevIndex + 1;
        if (newIndex === 0) {
          // reshuffle
          setShuffledPhotos(shuffleArray([...photos]));
        }
        return newIndex;
      });
    };

    const prevPhoto = () => {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === 0 ? shuffledPhotos.length - 1 : prevIndex - 1
      );
    };

    return (
      <div className="relative w-full h-full">
        <img
          src={shuffledPhotos[currentPhotoIndex]}
          alt={`Photo ${currentPhotoIndex + 1}`}
          className="w-full h-full object-cover rounded"
        />
        <button
          onClick={prevPhoto}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-pink-100 bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full transition-all"
          aria-label="Previous photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          onClick={nextPhoto}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-100 bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full transition-all"
          aria-label="Next photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {shuffledPhotos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentPhotoIndex ? 'bg-pink-500' : 'bg-pink-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const ContactCard = () => {
    return (
      <div className="p-6 h-full bg-gradient-to-br from-pink-100 to-purple-50 rounded-lg flex flex-col">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-medium mb-2">emily!</h2>
          <div className="text-sm text-gray-600 italic">
            (future) medical student &amp; full stack developer
          </div>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-pink-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-4 w-4"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2
                      2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <a
              href="mailto:boymoder@estrogenizedtwink.com"
              className="text-gray-700 hover:text-pink-600 transition-colors"
            >
              boymoder@estrogenizedtwink.com
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-pink-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-4 w-4"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86
                      3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64
                      0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0
                      00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </div>
            <a
              href="https://twitter.com/hematologymoder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-pink-600 transition-colors"
            >
              @hematologymoder
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-pink-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-4 w-4"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547
                       l-2.387-.477a6 6 0 00-3.86.517l-.318.158
                       a6 6 0 01-3.86.517L6.05 15.21
                       a2 2 0 00-1.806.547M8 4h8l-1
                       1v5.172a2 2 0 00.586 1.414l5
                       5c1.26 1.26.367 3.414-1.415
                       3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5
                       A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-gray-700">san francisco!</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-pink-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-4 w-4"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9
                      9 0 00-9-9m9 9H3m9 9a9 9 0
                      01-9-9m9 9c1.657 0 3-4.03
                      3-9s-1.343-9-3-9m0 18c-1.657
                      0-3-4.03-3-9s1.343-9 3-9m-9
                      9a9 9 0 019-9" />
              </svg>
            </div>
            <span className="text-gray-700">hematology &amp; endocrinology</span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 font-mono">
          follow me on twitter!
        </div>
      </div>
    );
  };

// WINDOW ORDER FUCKERY I HOPE IT WORKS
  const [windowOrder, setWindowOrder] = useState([
    'contact',
    'photo',
    'lastfm',
    'shows',
    'movies',
    'reading',
    'message',
    'aboutMe',
    'terminal'
  ]);
  const [activeWindow, setActiveWindow] = useState(null);

  const bringWindowToFront = (windowId) => {
    if (activeWindow === windowId) return;
    setActiveWindow(windowId);
    setWindowOrder((prev) => [
      ...prev.filter((id) => id !== windowId),
      windowId
    ]);
  };

  const getWindowStyle = (windowId, baseStyle) => ({
    ...baseStyle,
    zIndex: windowOrder.indexOf(windowId),
    border:
      activeWindow === windowId
        ? '2px solid rgba(236, 72, 153, 0.5)'
        : '1px solid rgba(236, 72, 153, 0.2)',
    boxShadow:
      activeWindow === windowId
        ? '0 4px 12px rgba(236, 72, 153, 0.15)'
        : 'none'
  });

  // fetches twitter data every 5 minutes (doesnt work cause twitter api is shit)
  useEffect(() => {
    const fetchTwitter = async () => {
      try {
        const res = await fetch('/api/twitter/recent-tweets');
        if (res.ok) {
          const data = await res.json();
          setTwitterData(data);
        }
      } catch (error) {
        console.error('Error fetching Twitter data:', error);
      }
    };
    fetchTwitter();
    const interval = setInterval(fetchTwitter, 300000);
    return () => clearInterval(interval);
  }, []);

  // fetch last fm every 30 seconds
  useEffect(() => {
    const fetchLastFm = async () => {
      try {
        const res = await fetch('/api/lastfm/currently-playing', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setCurrentTrack(data);
        }
      } catch (error) {
        console.error('Error fetching Last.fm data:', error);
      }
    };
    fetchLastFm();
    const interval = setInterval(fetchLastFm, 30000);
    return () => clearInterval(interval);
  }, []);

  // message wondow submission
  const handleConfessionSubmit = async (e) => {
    e.preventDefault();
    if (!confession.trim()) return;
    setSmsStatus('Sending...');
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: confession })
      });
      if (res.ok) {
        setSmsStatus('Sent! ✨');
        setConfession('');
        setTimeout(() => {
          setSmsStatus('');
        }, 2000);
      } else {
        setSmsStatus('Failed to send 😢');
      }
    } catch (error) {
      setSmsStatus('Error sending message');
    }
  };

  const MobileWarning = () => {
    return (
      <div className="fixed inset-0 bg-[#f8e8ff] z-50 flex items-center justify-center p-6 lg:hidden">
        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-pink-200 max-w-sm text-center">
          <div className="text-3xl mb-4">✨</div>
          <h2 className="text-xl font-medium text-gray-800 mb-4">hi!</h2>
          <p className="text-gray-600 mb-4">
            this website works best on a laptop or larger screen! 
          </p>
          <p className="text-sm text-gray-500 font-mono">
            (you cant view it on a smaller screen yet, but you might be able to soon!)
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8e8ff] overflow-hidden">
      <MobileWarning />
      {/* menuuuuu bar */}
      <div className="menubar">
        <div className="menubar-left">
          <span>Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>
        <div className="menubar-right">
          <div className="system-stat">CPU {systemStats.cpu}%</div>
          <div className="system-stat">RAM {systemStats.ram}%</div>
          <div className="system-stat">
            <div className="battery-indicator">
              <div className="battery-icon">
                <div
                  className="battery-level"
                  style={{ width: `${systemStats.battery}%` }}
                />
              </div>
              {systemStats.battery}%
            </div>
          </div>
          <Clock />
        </div>
      </div>

      {/* windows container */}
      <div
        className="windows-container"
        style={{
          position: 'relative',
          height: 'calc(100vh - var(--menubar-height))',
          marginTop: 'var(--menubar-height)',
          overflow: 'hidden'
        }}
      >
        {/* images */}
        <Window
          title="images 🌐"
          style={getWindowStyle('photo', {
            width: '280px',
            height: '315px',
            left: '420px',
            top: '580px'
          })}
          onActivate={() => bringWindowToFront('photo')}
        >
          <PhotoSlideshow />
        </Window>

        {/* contact card */}
        <Window
          title="💌 contact"
          style={getWindowStyle('contact', {
            width: '380px',
            height: '360px',
            left: '20px',
            top: '470px'
          })}
          onActivate={() => bringWindowToFront('contact')}
        >
          <ContactCard />
        </Window>

        {/* shows */} 
        <Window
          title="📺 watching"
          style={getWindowStyle('shows', {
            width: '280px',
            height: '270px',
            left: '1050px',
            top: '20px'
          })}
          onActivate={() => bringWindowToFront('shows')}
        >
          <div className="space-y-4">
            <textarea
              value={favorites.shows}
              onChange={(e) =>
                setFavorites((prev) => ({ ...prev, shows: e.target.value }))
              }
              className="w-full h-48 p-2 rounded text-sm"
            />
          </div>
        </Window>

        {/* reading list - moved to right side */}
        <Window
          title="📚 reading list"
          style={getWindowStyle('reading', {
            width: '400px',
            height: '850px',
            left: '1350px',
            top: '20px'
          })}
          onActivate={() => bringWindowToFront('reading')}
        >
          <div className="space-y-4">
            <textarea
              value={favorites.books}
              readOnly
              className="w-full h-full p-2 rounded text-sm font-mono hide-scrollbar"
              style={{ height: 'calc(100vh - 200px)' }}
            />
          </div>
        </Window>

        {/* last fm */}
        <Window
          title="🎵 now playing"
          style={getWindowStyle('lastfm', {
            width: '400px',
            height: '500px',
            left: '620px',
            top: '20px'
          })}
          onActivate={() => bringWindowToFront('lastfm')}
        >
          <LastFM currentTrack={currentTrack} />
        </Window>

        {/* message */}
        <Window
          title="✨ message"
          style={getWindowStyle('message', {
            width: '280px',
            height: '280px',
            left: '730px',
            top: '600px'
          })}
          onActivate={() => bringWindowToFront('message')}
        >
          <div className="p-4 bg-white h-full rounded-b-lg">
            <form onSubmit={handleConfessionSubmit} className="space-y-4">
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder="type ur message here!!"
                required
                className="w-full h-24 p-2 border border-pink-200 rounded focus:outline-none focus:border-pink-400"
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-100 hover:bg-pink-200 rounded transition-colors"
                >
                  send! ✨
                </button>
                {smsStatus && (
                  <span className="text-sm text-gray-600">{smsStatus}</span>
                )}
              </div>
            </form>
          </div>
        </Window>

        {/* about me */}
        <Window
          title="👋 about me"
          style={getWindowStyle('aboutMe', {
            width: '280px',
            height: '270px',
            left: '1050px',
            top: '310px'
          })}
          onActivate={() => bringWindowToFront('aboutMe')}
        >
          <div className="space-y-4">
            <textarea
              value={favorites.aboutMe}
              onChange={(e) =>
                setFavorites((prev) => ({ ...prev, aboutMe: e.target.value }))
              }
              className="w-full h-48 p-2 rounded text-sm"
            />
          </div>
        </Window>

        {/* terminal */}
        <Window
          title="💻 Terminal"
          style={getWindowStyle('terminal', {
            width: '480px',
            height: '440px',
            left: '20px',
            top: '20px'
          })}
          onActivate={() => bringWindowToFront('terminal')}
        >
          <Terminal />
        </Window>

        {/* stocks and news */}
        <Window
          title="stocks and news"
          style={getWindowStyle('movies', {
            width: '280px',
            height: '270px',
            left: '1050px',
            top: '600px'
          })}
          onActivate={() => bringWindowToFront('movies')}
        >
          <div className="space-y-4">
            <textarea
              value={favorites.movies}
              onChange={(e) =>
                setFavorites((prev) => ({ ...prev, movies: e.target.value }))
              }
              className="w-full h-48 p-2 rounded text-sm"
            />
          </div>
        </Window>

      </div>

      {/* feedback button */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg border border-pink-200 hover:border-pink-400 transition-colors z-50"
      >
        ✨ feedback
      </button>

      {}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
