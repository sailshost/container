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

  const create_web = async () => {
    const container = await docker.createContainer({
      name: `sails_web_${generated_uuid}`,
      Image: "sails_react:latest",
      HostConfig: {
        Mounts: [
          {
            Target: "/app",
            Source: volume.name,
            Type: "volume",
          },
        ],
      },
    });
    await container.start();
    await network.connect({ Container: container.id });
  };

  const create_sftp = async () => {
    const container = await docker.createContainer({
      name: `sails_sftp_${generated_uuid}`,
      Image: "sails_sftp:latest",
      HostConfig: {
        Mounts: [
          {
            Target: "/app",
            Source: volume.name,
            Type: "volume",
          },
        ],
      },
    });

    await container.start();
    await network.connect({ Container: container.id });
  };

  const create_proxy = async () => {
    const container = await docker.createContainer({
      name: `sails_proxy_${generated_uuid}`,
      Image: "sails_nginx:latest",
      HostConfig: {
        Mounts: [
          {
            Target: "/app",
            Source: volume.name,
            Type: "volume",
          },
        ],
      },
    });
    await container.start();
    await network.connect({ Container: container.id });
  };

  create_web();
  create_sftp();
  // create_proxy();

  return res.send({
    successful: true,
  });
});

router.post("/upload", (req, res) => {});

export default router;
