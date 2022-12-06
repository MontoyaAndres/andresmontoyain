import { Card } from "../card";
import { ListContent } from "./styles";

export const Home = () => {
  return (
    <>
      <ListContent />
      <div className="container">
        <p className="brief-description">
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