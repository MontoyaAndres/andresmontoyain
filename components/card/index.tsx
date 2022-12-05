interface IProps {
  title: string;
  texts: string[];
  description: string;
}

export const Card = (props: IProps) => {
  const { title, texts, description } = props;

  return (
    <>
      <style jsx>{`
        .card {
          width: 100%;
          background-color: var(--gray-color);
          padding: 20px;
          box-shadow: var(--shadow-smallest);
          cursor: pointer;

          .card-title {
            margin: 0;
            font-weight: 800;
            font-size: var(--font-2xl);
            color: var(--secondary-color);
          }

          .card-texts {
            margin: 10px 0;
            display: flex;
            grid-gap: 20px;

            .card-text {
              margin: 0;
              font-size: var(--font-base);
              color: var(--light-secondary-color);
            }
          }

          .card-description {
            margin: 0;
            font-size: var(--font-xl);
            color: var(--secondary-color);
            line-height: 1.6;

            & > a {
              color: var(--primary-color);
            }
          }
        }
      `}</style>
      <div className="card">
        <p className="card-title">{title}</p>
        <div className="card-texts">
          {texts.map((text, index) => (
            <p className="card-text" key={index}>
              {text}
            </p>
          ))}
        </div>
        <p className="card-description">{description}</p>
      </div>
    </>
  );
};
