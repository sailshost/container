import { Router, Response, Request } from "express";
import Docker from "dockerode";
import { v4 as uuid_v4 } from "uuid";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const router = Router();

router.post("/new", async (_req: Request, res: Response) => {
  const generated_uuid = uuid_v4().replaceAll("-", "");

  const network = await docker.createNetwork({
    Name: `sails_net_${generated_uuid}`,
  });

  const volume = await docker.createVolume({
    Name: `sails_volume_${generated_uuid}`,
  });

  const webContainer = await docker.createContainer({
    name: `sails_web_${generated_uuid}`,
    Image: "sails_react:latest",
  });

  const sftpContainer = await docker.createContainer({
    name: `sails_web_${generated_uuid}`,
    Image: "sails_sftp:latest",
  });

  await webContainer.start();
  await sftpContainer.start();
  await network.connect({ Container: webContainer.id });
  await network.connect({ Container: sftpContainer.id });

  return res.send({
    successful: true,
    debug_info: {
      uuid: generated_uuid,
      container: {
        id: webContainer.id,
        name: `sails_web_${generated_uuid}`,
      },
      network: {
        id: network.id,
        name: `sails_net_${generated_uuid}`,
      },
    },
  });
});

export default router;
