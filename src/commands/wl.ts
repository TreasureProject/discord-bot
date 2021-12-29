import * as server from "../lib/server.js";
import * as user from "../lib/user.js";
import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Discord()
abstract class WL {
  @SimpleCommand("wl")
  async wl(command: SimpleCommandMessage) {
    if (!server.isEnjoyor(command.message.guildId)) {
      return;
    }

    if (!user.isAdmin(command.message.member?.user.id)) {
      return;
    }

    try {
      const max = getRandom(15, 45);
      const seconds = getRandom(15, 46);
      const time = seconds * 1_000;

      // Wait between 1-5 minutes before sending the message
      await wait(getRandom(1, 6) * 60_000);

      const message = await command.message.channel.send({
        embeds: [
          {
            description: "React to this message to get on the whitelist.",
            color: 0xcceedd,
          },
        ],
      });

      await message.react("👍");
      await message.awaitReactions({
        filter: (reaction, user) => {
          return "👍" === reaction.emoji.name && user.id !== message.author.id;
        },
        max,
        time,
      });

      await message.delete();

      const [users] = message.reactions.cache
        .map((reaction) => reaction.users.cache.filter((user) => !user.bot))
        .flat();

      // Add `Next` role
      const role = command.message.guild?.roles.cache.find(
        (role) => role.id === "925836438648533072"
      );

      for await (const [userId] of users) {
        const member = command.message.guild?.members.cache.find(
          (member) => member.user.id === userId
        );

        if (role) {
          await member?.roles.add(role);
        }
      }
    } catch (error) {
      console.log("!wl Error: ", error);
    }
  }
}
