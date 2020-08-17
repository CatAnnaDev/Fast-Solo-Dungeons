const SettingsUI = require('tera-mod-ui').Settings;
const Vec3 = require('tera-vec3');

module.exports = function Solodungeon(mod) {
	
    const blacklist = [9713];
    const whitelist = [9031, 9032];

    let loot,
        zone;

    mod.command.add('fastsolo', () => {
        if (ui) {
            ui.show();
        } else {		
            mod.settings.fastsolo = !mod.settings.fastsolo;
            mod.command.message(`Fast solo dungeons is now ${mod.settings.fastsolo ? "enabled" : "disabled"}.`);
        }
    });
	
    mod.command.add('acereset', () => {
        if (ui) {
            ui.show();
        } else {		
            mod.settings.acereset = !mod.settings.acereset;
            mod.command.message(`Autoreset is now ${mod.settings.acereset ? "enabled" : "disabled"}.`);
        }
    });
		
    mod.hook('S_LOAD_TOPO', 3, event => {
        zone = event.zone;
        loot = {};
    });
        
    mod.hook('S_SPAWN_ME', 3, event => {
        if (!mod.settings.fastsolo) return;
        switch(zone) {
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

    mod.hook('S_SPAWN_DROPITEM', 8, event => {
        if(!(blacklist.indexOf(event.item) > -1)) loot[event.gameId.toString()] = 1;
    });

    mod.hook('S_DESPAWN_DROPITEM', 4, event => {
        if(event.gameId.toString() in loot) delete loot[event.gameId.toString()];
        if(Object.keys(loot).length < 1 && zone > 9000) resetinstance();
    });

    function resetinstance() {
        if (!mod.settings.acereset) return;
        if((zone == 9031 || zone == 9032|| zone == 3016) && whitelist.indexOf(zone) > -1)  mod.send('C_RESET_ALL_DUNGEON', 1, null);
    }

	const data = {7005: {spawn: new Vec3(-481, 6301, 1956), redirect: new Vec3(-341, 8665, 2180), w: -0.96}};	
	const chestloc = new Vec3(52562, 117921, 4431);
	const chests = [81341, 81342];	

	let banyaka = 81301,
	    reset = false;

    mod.command.add('velikaredirect', () => {
        if (ui) {
            ui.show();
        } else {		
            mod.settings.velikaredirect = !mod.settings.velikaredirect;
            mod.command.message(`Velikaredirect is now ${mod.settings.velikaredirect ? "enabled" : "disabled"}.`);
        }
    });
	
    mod.command.add('ghilliereset', () => {
        if (ui) {
            ui.show();
        } else {		
            mod.settings.ghilliereset = !mod.settings.ghilliereset;
            mod.command.message(`Ghilliereset is now ${mod.settings.ghilliereset ? "enabled" : "disabled"}.`);
        }
    });
	
    mod.command.add('boxredirect', () => {
        if (ui) {
            ui.show();
        } else {		
            mod.settings.boxredirect = !mod.settings.boxredirect;
            mod.command.message(`Boxredirect is now ${mod.settings.boxredirect ? "enabled" : "disabled"}.`);
        }
    });		

	mod.hook('S_BOSS_GAGE_INFO',3,(event) => {
		if(!mod.settings.boxredirect) return;
			if ((Number.parseInt(event.curHp) / Number.parseInt(event.maxHp)*10000)/100 <= 20 && event.templateId == banyaka) {
			    teleport();
		}
    });	

	mod.game.me.on('change_zone', (zone) => {
		if (!mod.settings.ghilliereset) return;
		if (zone == 9714 && reset) {
			mod.send('C_RESET_ALL_DUNGEON', 1, {});
			reset = false;
			mod.command.message('Ghillieglade has been reset.');
		}
	});

	mod.hook('S_SPAWN_ME', 3, event => {
		if (!mod.settings.velikaredirect || !data[mod.game.me.zone]) return;
		if (event.loc.equals(data[mod.game.me.zone].spawn)) {
			event.loc = data[mod.game.me.zone].redirect;
			if (data[mod.game.me.zone].w)
				event.w = data[mod.game.me.zone].w;
		}
		return true;
	});

	mod.hook('S_SPAWN_NPC', 11, event => {
		if (!mod.settings.ghilliereset) return;
		if (event.huntingZoneId == 713 && chests.includes(event.templateId)) {
			reset = true;
			mod.command.message('Ghillieglade will be reset the next time you enter veliks sanctuary.');
		}
	});

	mod.hook('C_RESET_ALL_DUNGEON', 1, event => {
		if (!mod.settings.ghilliereset) return;
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

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 255 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};
