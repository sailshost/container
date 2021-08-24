import { Router, Response, Request } from "express";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const router = Router();

router.post("/new", async (req: Request, res: Response) => {
  const network = await docker.createNetwork({
    Name: "sails_w8q",
    Driver: "bridge",
  });

  const container = await docker.createContainer({
    Image: "sails_test:latest",
  });

  network.connect({ Container: container.id });

  return res.send({ ok: true });
});

export default router;
