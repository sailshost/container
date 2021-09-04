import { Router, Response, Request } from "express";
import Docker from "dockerode";
import { v4 as uuid_v4 } from "uuid";
import generator from "project-name-generator";


const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const router = Router();

router.post("/new", async (_req: Request, res: Response) => {
  const generated_uuid = uuid_v4().replaceAll("-", "");
  const generated_name = generator({ number: true }).dashed;

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
      Env: [`VIRTUAL_HOST=${generated_name}.sailshost.com`, "DHPARAM_GENERATION=false", "CERT_NAME=sailshost.com"],
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

  create_web();
  create_sftp();

  return res.send({
    successful: true,
    uuid: generated_name 
  });
});

router.post("/upload", (req, res) => {});

export default router;
