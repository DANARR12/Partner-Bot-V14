const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');
const client = new Client({ partials: [Partials.Channel, Partials.Messages, Partials.GuildMembers, Partials.DirectMessages], intents: 
  [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.DirectMessageTyping,
GatewayIntentBits.DirectMessages,
GatewayIntentBits.GuildInvites
  ]});
const db = require('multiple.db');
db.useJSON()
const ms = require('ms');
const { partner, link, idvc }  = require('./config.json');

client.once('ready', async () => {
 console.log(client.user.tag);
 client.user.setActivity(`Wednesday`, { type: ActivityType.Watching })
});

client.on("messageCreate", (message) => {
  if (message.content === "Reklam") {
        message.reply(`رێکلام لە تایبەت بۆم بنێرە`);
  }
  if (message.content === "reklam") {
        message.reply(`رێکلام لە تایبەت بۆم بنێرە`);
    }
});

client.on("messageCreate", async message => {
  if (message.channel.type === ChannelType.DM) return;
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
    return message.channel.send(`**Dm Me For Ads**`);
  }
});

client.on('messageCreate',async (message) => {
    if (message.author.bot) return;
    if (message.channel.type == ChannelType.DM) {
      
    let share = await client.channels.cache.get(partner);
    let args = await message.content.split(' ');
    let cool = await db.get(`cool_${message.author.id}`)

    if(!share) return;
    if (cool > Date.now()) {
        return await message.author.send({content : 'ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای 5خولەک'}).catch(async (err) => {
            await message.channel.send({content : `${message.author} Sorry You Can Send Your Advertisement Again After 5m `})
        }).catch(err => undefined);
    }
    let time = await Date.now() + ms('60m');
    try {
    await client.fetchInvite(args[0]).then(async (invite) => {
        await db.set(`cool_${message.author.id}`,time);
        await share.send({content: `${invite}\n **📨 Posted By** ${message.author}`});
        await message.channel.send({content : `
> 📪 **Posted In ${share}**
> 📮 **Post This Link in Your Server To** ${link}`}).catch(async (err) => {
            await message.channel.send({content : `> **${message.author} You Server Posted in ${share}**`});
        })
    }).catch(async (err) => {
      console.log(err)
        await message.channel.send({content: '> **:x: |  Invalid Link Try Again!**'});
    })
   } catch (err) {
      console.log(err)
       return;
    }}
})

client.on("ready", async() => {
 try{
const { joinVoiceChannel } = require('@discordjs/voice'); 

await client.channels.fetch(`${idvc}`).then((channel) => { 
  console.log(`${client.user.tag} Connected To Voice`) 
const VoiceConnection = joinVoiceChannel({ channelId: channel.id, 
guildId: channel.guild.id, 
adapterCreator: channel.guild.voiceAdapterCreator,
selfDeaf: true,
selfMute: true
  }); 
     });
  } catch (err) {
console.log(err)
}
});

client.login(process.env.DISCORD_TOKEN)
