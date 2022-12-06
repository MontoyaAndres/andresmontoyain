import { Card } from "../card";
import { ListContent } from "../home/styles";

export const Articles = () => {
  return (
    <>
      <ListContent />
      <div className="container">
        <p className="brief-description">
          Articles are single-page pieces that give a whirlwind tour of a
          specific topic.
        </p>
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
