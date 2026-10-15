import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const example = `public sealed class Gamemode : Package
{
    protected override void OnStart() => Player.OnReady += OnPlayerReady;

    private static void OnPlayerReady(Player player)
    {
        var character = new Character(new Vector(0, 0, 200), Rotator.Zero, "nanos-world::SK_Mannequin");
        player.Possess(character);
    }

    [ServerEvent]
    private void OnDeath(CharacterDeathEvent e) => Log.Info($"{e.Character} was killed by {e.Instigator}");
}`;

const features = [
  {
    title: 'Native speed',
    description:
      'NanosSharp talks to the engine directly instead of going through Lua. Calls into nanos world are faster than from Lua and C# code itself runs many times faster.',
  },
  {
    title: 'Typed API with hot reload',
    description:
      'The whole scripting API is generated with types, properties, events and documentation. Save a .cs file and the package rebuilds and reloads without restarting the server.',
  },
  {
    title: 'Fits into nanos world',
    description:
      'Every C# package is a regular nanos world package. It runs next to Lua packages, shares values with them and can use any NuGet package.',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout description="Write nanos world server packages in C# with a typed API, hot reload and NuGet support.">
      <header className={styles.hero}>
        <div className="container">
          <img className={styles.logo} src={useBaseUrl('/img/logo.png')} alt="NanosSharp" />
          <Heading as="h1" className={styles.title}>
            NanosSharp
          </Heading>
          <p className={styles.tagline}>Write nanos world server packages in C#.</p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/installation">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              What is NanosSharp?
            </Link>
          </div>
        </div>
      </header>
      <main className="container">
        <section className={styles.features}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.feature}>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>
        <section className={styles.example}>
          <CodeBlock language="csharp" title="Server/Gamemode.cs">
            {example}
          </CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
