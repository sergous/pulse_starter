import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { withPulse } from "@prisma/extension-pulse";
import { withAccelerate } from "@prisma/extension-accelerate";

process.on("SIGINT", () => {
  process.exit(0);
});

const apiKey: string = process.env.PULSE_API_KEY ?? "";
const prisma = new PrismaClient()
  .$extends(withPulse({ apiKey: apiKey }))
  .$extends(withAccelerate());

async function main() {
  const foundUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: "test",
      },
    },
    cacheStrategy: { ttl: 60 },
  });

  console.log("found users", foundUsers);

  const stream = await prisma.user.stream();

  process.on("exit", (code) => {
    stream.stop();
  });

  for await (const event of stream) {
    console.log("just received an event:", event);
  }
}

main();
