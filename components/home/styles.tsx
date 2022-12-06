export const ListContent = () => {
  return (
    <>
      <style jsx global>{`
        .container {
          padding: 20px;
          margin: 0 auto;
          max-width: 760px;

          @media (min-width: 1024px) {
            padding: 0;
            margin-top: 20px;
          }
        }

        .brief-description {
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
    </>
  );
};
