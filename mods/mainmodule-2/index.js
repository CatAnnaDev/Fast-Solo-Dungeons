const config = require('./config.json');
const Vec3 = require('tera-vec3');

module.exports = function Velikaredirect(mod) {
	
	if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
		mod.warn('You are trying to use this module on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future.');	
	
	const chests = [81341, 81342],
	chestloc = new Vec3(52562, 117921, 4431),
	data = {
		7005: { // Velika
			spawn: new Vec3(-481, 6301, 1956),
			redirect: new Vec3(-341, 8665, 2180),
			w: -0.96
		}
	};

	let velikaredirect = config.velikaredirect,
	    ghilliereset = config.ghilliereset,
            boxredirect = config.boxredirect,
            banyaka = 81301,
	    reset = false;

    mod.command.add('velikaredirect', () => {			
            velikaredirect = !velikaredirect;
            mod.command.message(`Velikaredirect is now ${velikaredirect ? "enabled" : "disabled"}.`);
    });
	
    mod.command.add('ghilliereset', () => {		
            ghilliereset = !ghilliereset;
            mod.command.message(`Ghilliereset is now ${ghilliereset ? "enabled" : "disabled"}.`);
    });
	
    mod.command.add('boxredirect', () => {		
            boxredirect = !boxredirect;
            mod.command.message(`Boxredirect is now ${boxredirect ? "enabled" : "disabled"}.`);
    });		

	mod.hook('S_BOSS_GAGE_INFO',3,(event) => {
		if(!boxredirect) return;
			if ((Number.parseInt(event.curHp) / Number.parseInt(event.maxHp)*10000)/100 <= 20 && event.templateId == banyaka) {
			    teleport();
		}
    });	
	
	mod.game.me.on('change_zone', (zone) => {
		if (!ghilliereset) return;
		if (zone == 9714 && reset) {
			mod.send('C_RESET_ALL_DUNGEON', 1, {});
			reset = false;
			mod.command.message('Ghillieglade has been reset.');
		}
	});

	mod.hook('S_SPAWN_ME', 3, event => {
		if (!velikaredirect || !data[mod.game.me.zone]) return;
		if (event.loc.equals(data[mod.game.me.zone].spawn)) {
			event.loc = data[mod.game.me.zone].redirect;
			if (data[mod.game.me.zone].w)
				event.w = data[mod.game.me.zone].w;
		}
		return true;
	});

	mod.hook('S_SPAWN_NPC', 10, event => {
		if (!ghilliereset) return;
		if (event.huntingZoneId == 713 && chests.includes(event.templateId)) {
			reset = true;
			mod.command.message('Ghillieglade will be reset the next time you enter veliks sanctuary.');
		}
	});

	mod.hook('C_RESET_ALL_DUNGEON', 1, event => {
		if (!ghilliereset) return;
		if (mod.game.me.zone == 9713) {
			reset = false;
			mod.command.message('Ghillieglade was reset manually.');
		}
	});
	
	function teleport() {
		mod.send('S_INSTANT_MOVE', 3, {
				gameId: mod.game.me.gameId,
				loc: chestloc,
				w: 0.18
			});
		return false;
	}
};
