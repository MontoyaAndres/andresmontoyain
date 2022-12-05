import { Card } from "../card";

export const Home = () => {
  return (
    <>
      <style jsx>{`
        .container {
          padding: 20px;
          margin: 0 auto;
          max-width: 760px;

          @media (min-width: 1024px) {
            padding: 0;
            margin-top: 20px;
          }
        }

        .description-myself {
          margin: 0;
          font-weight: 500;
          font-size: var(--font-base);
          color: var(--secondary-color);
          line-height: 1.6;

          & > a {
            color: var(--primary-color);
            font-weight: 500;
          }

          @media (min-width: 1024px) {
            font-size: var(--font-xl);
          }
        }

        .title {
          margin: 0;
          margin-top: 20px;
          font-weight: 800;
          font-size: var(--font-2xl);
          color: var(--secondary-color);

          @media (min-width: 1024px) {
            font-size: var(--font-3xl);
          }
        }

        .cards {
          margin-top: 20px;
          margin-bottom: 100px;
          display: grid;
          grid-gap: 20px;
        }
      `}</style>
      <div className="container">
        <p className="description-myself">
          Hi there, I'm <a href="/about">Andrés Montoya</a>, Software Developer
          building scalable and cost-effective products in the decentralized
          cloud. I just share here what I learn :).
        </p>
        <p className="title">Recent articles</p>
        <div className="cards">
          <Card
            title="hey"
            description="lol"
            texts={["Nov 04, 2022", "5 minutes read", "stuff"]}
          />
        </div>
      </div>
    </>
  );
};
