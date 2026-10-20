import {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const files = [
  {
    path: 'Server/Gamemode.cs',
    side: 'runs on the server',
    code: `public sealed class Gamemode : Package
{
    protected override void OnStart() => Player.OnReady += OnReady;

    private static void OnReady(Player player)
    {
        var character = new Character(new Vector(0, 0, 200), Rotator.Zero,
            "nanos-world::SK_Mannequin");
        player.Possess(character);
        Events.CallRemote("Welcome", player, Teams.MaxPlayers);
    }
}`,
  },
  {
    path: 'Client/Hud.cs',
    side: 'runs on every player',
    code: `public sealed class Hud : Package
{
    protected override void OnStart() =>
        Events.SubscribeRemote("Welcome", (long slots) =>
            Log.Info($"Welcome to {Title}, {Client.LocalPlayer?.Name}! Up to {slots} players."));
}`,
  },
  {
    path: 'Shared/Teams.cs',
    side: 'runs on both sides',
    code: `public static class Teams
{
    public const int MaxPlayers = 16;

    public static string NameOf(int team) => team == 0 ? "Blue" : "Orange";
}`,
  },
];

const facts = [
  {label: 'Runtime', value: '.NET 10 inside the server and the game'},
  {label: 'Server', value: 'Linux x64, plain or in Docker'},
  {label: 'Client', value: 'Windows and Proton, sandboxed'},
  {label: 'Lua', value: 'Side by side, exports in both directions'},
];

const steps = [
  {
    title: 'Install NanosSharp',
    command: './nanossharp-install server',
    link: '/docs/getting-started/installation',
  },
  {
    title: 'Create a package',
    command: 'dotnet new nanossharp-script -n MyGamemode -o my-gamemode',
    link: '/docs/getting-started/first-package',
  },
  {
    title: 'Start the server',
    command: './NanosSharp.sh',
    link: '/docs/getting-started/installation#start-the-server-with-the-launcher',
  },
];

function PackageWindow(): ReactNode {
  const [selected, setSelected] = useState(0);
  const file = files[selected];

  return (
    <div className={styles.stage}>
      <svg className={styles.orbit} viewBox="0 0 800 520" aria-hidden="true">
        <defs>
          <linearGradient id="orbit-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#18c3f5" stopOpacity="0" />
            <stop offset="0.45" stopColor="#18c3f5" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <g transform="rotate(-11 400 260)">
          <path
            id="orbit-path"
            d="M 12 260 A 388 200 0 1 1 788 260 A 388 200 0 1 1 12 260"
            fill="none"
            stroke="url(#orbit-stroke)"
            strokeWidth="2"
          />
          <circle className={styles.orbitDot} r="5" fill="#ffffff">
            <animateMotion dur="16s" repeatCount="indefinite">
              <mpath href="#orbit-path" />
            </animateMotion>
          </circle>
        </g>
      </svg>
      <div className={styles.window}>
        <div className={styles.tabs} role="tablist" aria-label="Files of the example package">
          {files.map((entry, index) => (
            <button
              key={entry.path}
              type="button"
              role="tab"
              aria-selected={index === selected}
              className={index === selected ? styles.tabActive : styles.tab}
              onClick={() => setSelected(index)}>
              {entry.path}
            </button>
          ))}
        </div>
        <div className={styles.side}>{file.side}</div>
        <CodeBlock language="csharp" className={styles.code}>
          {file.code}
        </CodeBlock>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout description="Write nanos world packages in C# for the server and the game client, with a typed API, hot reload and Lua side by side.">
      <header className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>.NET for nanos world</p>
            <Heading as="h1" className={styles.title}>
              Write nanos world packages in C#.
            </Heading>
            <p className={styles.tagline}>
              On the server and in the game client, with a typed API generated from the game itself. Your C# packages run
              next to your Lua packages and share values with them.
            </p>
            <div className={styles.buttons}>
              <Link className={styles.primary} to="/docs/getting-started/installation">
                Get started
              </Link>
              <Link className={styles.secondary} to="/docs/intro">
                What is NanosSharp?
              </Link>
            </div>
          </div>
          <PackageWindow />
        </div>
      </header>
      <main>
        <section className={styles.facts} aria-label="At a glance">
          <div className="container">
            <dl className={styles.factList}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section className={`container ${styles.start}`}>
          <Heading as="h2" className={styles.startTitle}>
            From an empty server to a running package
          </Heading>
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <Link to={step.link} className={styles.stepLink}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <code className={styles.stepCommand}>{step.command}</code>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </Layout>
  );
}
