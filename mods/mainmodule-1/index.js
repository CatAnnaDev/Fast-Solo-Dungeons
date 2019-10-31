const config = require('./config.json');
const Vec3 = require('tera-vec3');

module.exports = function Solodungeon(mod) {
	
	if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
		mod.warn('You are trying to use this module on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future.');

    const blacklist = [9777, 9713, 9916];
    const whitelist = [9031, 9032];

    let fastsolo = config.fastsolo,
        acereset = config.acereset,
        loot,
        zone;

    mod.command.add('fastsolo', () => {			
            fastsolo = !fastsolo;
            mod.command.message(`Fast solo dungeons is now ${fastsolo ? "enabled" : "disabled"}.`);
    });
	
    mod.command.add('acereset', () => {			
            acereset = !acereset;
            mod.command.message(`Autoreset is now ${acereset ? "enabled" : "disabled"}.`);
    });	
		
    mod.hook('S_LOAD_TOPO', 3, event => {
        zone = event.zone;
        loot = {};
    });
        
    mod.hook('S_SPAWN_ME', 3, event => {
        if (!fastsolo) return;
        switch(zone) {
            case 9777: // Channelworks
                event.loc = new Vec3(-112670, -33091, 461)
                event.w = 1.5
                return true;
            case 9713: // Ghillie
                event.loc = new Vec3(52233, 117319, 4382)
                event.w = 1.5
                return true;
            case 9031: // Ace Akasha	
                event.loc = new Vec3(72424, 133968, -502)
                event.w = 1.5
                return true;
            case 9032: // Ace Baracos
                event.loc = new Vec3(28214, 178550, -1675)
                event.w = 1.5
                return true;			
            default: return;
        }
    });

    mod.hook('S_SPAWN_DROPITEM', 6, event => {
        if(!(blacklist.indexOf(event.item) > -1)) loot[event.gameId.toString()] = 1;
    });

    mod.hook('S_DESPAWN_DROPITEM', 4, event => {
        if(event.gameId.toString() in loot) delete loot[event.gameId.toString()];
        if(Object.keys(loot).length < 1 && zone > 9000) Resetinstance();
    });

    function Resetinstance() {
        if (!acereset) return;
        if((zone == 9031 || zone == 9032) && whitelist.indexOf(zone) > -1)  mod.send('C_RESET_ALL_DUNGEON', 1, null);
    }
};
