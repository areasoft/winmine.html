/* Created by Anthony Fucci (anthonyfucci.com) */

var winmine = {};

winmine.load_board_settings = function() {
	const url_parameters = new URLSearchParams(window.location.search);
	/* url components needed to set minimum variables needed for gameplay */
	if(url_parameters.has('height') && url_parameters.has('width') && url_parameters.has('mines')) {
		winmine.height = parseInt(url_parameters.get('height'));
		winmine.width = parseInt(url_parameters.get('width'));
		winmine.mine_count = parseInt(url_parameters.get('mines'));
	} else {
		if (url_parameters.has('board_mines') | url_parameters.has('board_backup_mine') | url_parameters.has('time') | url_parameters.has('action_replay')) {
			alert('Error. Replay parameters all required together in url: \'height\' \'width\' \'mines\' \'board_mines\' \'board_backup_mine\' \'time\' and \'action_replay\'');
			return;
		}
		winmine.height = winmine.setting.beginner[0];
		winmine.width = winmine.setting.beginner[1];
		winmine.mine_count = winmine.setting.beginner[2];
	}
	/* url components needed to replay a previous board. this should show a refresh icon always on by default in the top right menu to indicate it is a replay. clicking the replay icon will refresh the page too. once game is played and ends, show the usual menu showed when game ends */
	if(url_parameters.has('board_mines') && url_parameters.has('board_backup_mine')) {
		document.getElementsByClassName('is-prev-game-menu-frame')[0].classList.add('is-prev-game-menu-frame-enabled');
		winmine.mines = JSON.parse(url_parameters.get('board_mines'));
		winmine.backup_y = parseInt(url_parameters.get('board_backup_mine').split('_')[0], 10);
		winmine.backup_x = parseInt(url_parameters.get('board_backup_mine').split('_')[1], 10);
		winmine.play_again_mode = true;
	}
	/* url components needed to configure a video-style playback */
	if(url_parameters.has('board_mines') && url_parameters.has('board_backup_mine') && url_parameters.has('time') && url_parameters.has('action_replay')) {
		winmine.update_game_over_menu();
		winmine.mines = JSON.parse(url_parameters.get('board_mines'));
		winmine.backup_y = parseInt(url_parameters.get('board_backup_mine').split('_')[0], 10);
		winmine.backup_x = parseInt(url_parameters.get('board_backup_mine').split('_')[1], 10);
		winmine.game_duration = url_parameters.get('time');
		winmine.action_replay = JSON.parse(url_parameters.get('action_replay'));
		/* set question mark behavior for replay based on seeing any question marks in action history. */
		/* this does not support replay of games where the user changed the question mark setting during game play. we would need to know every time the setting was changed to do the same during replay */
		const question_actions = winmine.action_replay.filter(x => x[1]==='q');
		winmine.setting.marks = (question_actions.length > 0) ? true : false;
		document.querySelector('.menu-item[data-name="Marks (?)"]').classList.add('menu-item-disabled');
		winmine.replay_mode = true;
		winmine.replay_pause = true; /* default paused */
		winmine.replay_autoplay = (url_parameters.has('autoplay')) ? (url_parameters.get('autoplay').toString() === 'true') : false;
		const play_pause = document.querySelector('.replay-menu-item[data-replay-menu="play-pause-button"]');
		play_pause.classList.add('replay-menu-item-enabled');
		const cursor = document.createElement('div');
		cursor.classList.add('replay-cursor'); /* cursor for replay stored as css class background-image */
		document.body.prepend(cursor);
		/* two visual window overlay items are needed so menu can still be interacted with, one for red alert border, and one for blocking pointer events on game board */
		const game_frame = document.createElement('div');
		game_frame.classList.add('replay-mode-game-container-overlay');
		document.body.prepend(game_frame);
		const window_frame = document.createElement('div');
		window_frame.classList.add('replay-mode-html-body-overlay');
		document.body.prepend(window_frame);
		/* visual red alert border effect on click behavior */
		game_frame.addEventListener('mousedown', function() {
			window_frame.classList.add('replay-mode-html-body-overlay-enabled');
			document.getElementsByClassName('menu-opener-item')[0].classList.add('color-red');
		});
		game_frame.addEventListener('mouseup', function() {
			window_frame.classList.remove('replay-mode-html-body-overlay-enabled');
			document.getElementsByClassName('menu-opener-item')[0].classList.remove('color-red');
		});
		game_frame.addEventListener('mouseleave', function() {
			window_frame.classList.remove('replay-mode-html-body-overlay-enabled');
			document.getElementsByClassName('menu-opener-item')[0].classList.remove('color-red');
		});

	}
};

/* Many features rely on localStorage. Wrap winmine.localStorage around window.localStorage so that we can treat configurations where localStorage is disabled (incognito browser?) differently */
winmine.is_localStorage_working = function() {
	try {
		localStorage.setItem('test', 'test');
		localStorage.removeItem('test');
		return true;
	}
	catch(e) {
		return false;
	}
};
winmine.wrap_localStorage = function() {
	if(!winmine.is_localStorage_working()) {
		/* set fallback functions */
		winmine.localStorage = {
			getItem: function(k) { return null; },
			setItem: function(k, v) { return null; },
			removeItem: function(k) { return null; },
			keys: function() { return []; }
		}
	} else {
		/* set wrapper functions */
		winmine.localStorage = {
			getItem: function(k) { return window.localStorage.getItem(k); },
			setItem: function(k, v) { window.localStorage.setItem(k, v); },
			removeItem: function(k) { window.localStorage.removeItem(k); },
			keys: function() { return Object.keys({ ...window.localStorage }); }
		}
	}
};

winmine.setting = {};
winmine.load_user_settings = function() {
	winmine.wrap_localStorage();
	if(winmine.localStorage.getItem('setting_beginner_board') != null) {
		const setting = winmine.localStorage.getItem('setting_beginner_board').split(',').map(i => parseInt(i, 10));
		winmine.setting.beginner = setting;
		winmine.setting.beginner2 = setting[0] + 'x' + setting[1] + '/' + setting[2];
	} else {
		winmine.localStorage.setItem('setting_beginner_board', '8,8,10');
		winmine.setting.beginner = [8,8,10];
		winmine.setting.beginner2 = '8x8/10';
	}
	if(winmine.localStorage.getItem('setting_cell_size_height') != null) {
		winmine.setting.y_px = parseInt(winmine.localStorage.getItem('setting_cell_size_height'), 10);
	} else {
		winmine.localStorage.setItem('setting_cell_size_height', '16');
		winmine.setting.y_px = 16;
	}
	if(winmine.localStorage.getItem('setting_cell_size_width') != null) {
		winmine.setting.x_px = parseInt(winmine.localStorage.getItem('setting_cell_size_width'), 10);
	} else {
		winmine.localStorage.setItem('setting_cell_size_width', '16');
		winmine.setting.x_px = 16;
	}
	if(winmine.localStorage.getItem('setting_player_name') != null) {
		winmine.setting.player_name = winmine.localStorage.getItem('setting_player_name');
	} else {
		winmine.localStorage.setItem('setting_player_name', 'Anonymous');
		winmine.setting.player_name = 'Anonymous';
	}
	if(winmine.localStorage.getItem('setting_api_url') != null) {
		winmine.setting.api_url = winmine.localStorage.getItem('setting_api_url');
	} else {
		winmine.localStorage.setItem('setting_api_url', 'minesweeper.win/api');
		winmine.setting.api_url = 'minesweeper.win/api';
	}
	winmine.setting.use_api = ((winmine.setting.api_url.trim().length > 4 && winmine.setting.api_url.includes('.')) || /^localhost/.test(winmine.setting.api_url)) ? true : false;
	if(winmine.localStorage.getItem('setting_extra_menu') != null) {
		winmine.setting.extra_menu = (winmine.localStorage.getItem('setting_extra_menu') === 'true') ? true : false;
	} else {
		winmine.localStorage.setItem('setting_extra_menu', 'true');
		winmine.setting.extra_menu = true;
	}
	if(winmine.localStorage.getItem('setting_color') != null) {
		winmine.setting.color = (winmine.localStorage.getItem('setting_color') === 'true') ? true : false;
	} else {
		winmine.localStorage.setItem('setting_color', 'true');
		winmine.setting.color = true;
	}
	if(winmine.localStorage.getItem('setting_marks') != null) {
		winmine.setting.marks = (winmine.localStorage.getItem('setting_marks') === 'true') ? true : false;
	} else {
		winmine.localStorage.setItem('setting_marks', 'true');
		winmine.setting.marks = true;
	}
	if(winmine.localStorage.getItem('setting_custom_field') != null) {
		winmine.setting.custom_field = JSON.parse(winmine.localStorage.getItem('setting_custom_field'));
	} else {
		winmine.localStorage.setItem('setting_custom_field', JSON.stringify([8,8,10]));
		winmine.setting.custom_field = [8,8,10];
	}
};

/* The counter and timer are 3 length elements, where each element is a literal "seven segment display" of 21x11 pixels: each pixel cell is assigned its A-G character position with css classes that can be toggled. */
winmine.sevseg = {};
winmine.sevseg.fill_seven_segment_container = function(seven_container_html_id) {
	winmine.sevseg.a_cells = [2,3,4,5,6,7,8,9,10,14,15,16,17,18,19,20,26,27,28,29,30];
	winmine.sevseg.b_cells = [22,32,33,42,43,44,53,54,55,64,65,66,75,76,77,86,87,88,98,99,110];
	winmine.sevseg.c_cells = [132,142,143,152,153,154,163,164,165,174,175,176,185,186,187,196,197,198,208,209,220];
	winmine.sevseg.d_cells = [202,203,204,205,206,212,213,214,215,216,217,218,222,223,224,225,226,227,228,229,230];
	winmine.sevseg.e_cells = [122,133,134,144,145,146,155,156,157,166,167,168,177,178,179,188,189,190,199,200,210];
	winmine.sevseg.f_cells = [12,23,24,34,35,36,45,46,47,56,57,58,67,68,69,78,79,80,89,90,100];
	winmine.sevseg.g_cells = [102,103,104,105,106,107,108,112,113,114,115,116,117,118,119,120,124,125,126,127,128,129,130];
	winmine.sevseg.style1_cells = [3,5,7,9,12,15,17,19,22,24,27,29,32,34,36,42,44,46,54,56,58,64,66,68,76,78,80,86,88,90,98,100,103,105,107,110,113,115,117,119,122,125,127,129,132,134,142,144,146,152,154,156,164,166,168,174,176,178,186,188,190,196,198,200,203,205,208,210,213,215,217,220,223,225,227,229];
	winmine.sevseg.style2_cells = [2,4,6,8,10,14,16,18,20,23,26,28,30,33,35,43,45,47,53,55,57,65,67,69,75,77,79,87,89,99,102,104,106,108,112,114,116,118,120,124,126,128,130,133,143,145,153,155,157,163,165,167,175,177,179,185,187,189,197,199,202,204,206,209,212,214,216,218,222,224,226,228,230];	
	const seven_height = 21;
	const seven_width = 11;
	const seven_container = document.getElementById(seven_container_html_id);
	for (let i = 1; i < ((seven_height*seven_width)+1); i += 1) {
		const cell_div = document.createElement('div');
		if(winmine.sevseg.a_cells.includes(i)) { cell_div.classList.add('A7'); }
		if(winmine.sevseg.b_cells.includes(i)) { cell_div.classList.add('B7'); }
		if(winmine.sevseg.c_cells.includes(i)) { cell_div.classList.add('C7'); }
		if(winmine.sevseg.d_cells.includes(i)) { cell_div.classList.add('D7'); }
		if(winmine.sevseg.e_cells.includes(i)) { cell_div.classList.add('E7'); }
		if(winmine.sevseg.f_cells.includes(i)) { cell_div.classList.add('F7'); }
		if(winmine.sevseg.g_cells.includes(i)) { cell_div.classList.add('G7'); }
		if(winmine.sevseg.style1_cells.includes(i)) { cell_div.classList.add('x7'); }
		if(winmine.sevseg.style2_cells.includes(i)) { cell_div.classList.add('y7'); }
		seven_container.append(cell_div);
	}
	const grid_template_rows = 'auto '.repeat(seven_height);
	const grid_template_columns = 'auto '.repeat(seven_width);
	seven_container.style.setProperty('grid-template-rows', grid_template_rows);
	seven_container.style.setProperty('grid-template-columns', grid_template_columns);
};

winmine.sevseg.get_segment_array = function(c) {
	if(c==='0') { return(['A','B','C','D','E','F']); }
	if(c==='1') { return(['B','C']); }
	if(c==='2') { return(['A','B','D','E','G']); }
	if(c==='3') { return(['A','B','C','D','G']); }
	if(c==='4') { return(['B','C','F','G']); }
	if(c==='5') { return(['A','C','D','F','G']); }
	if(c==='6') { return(['A','C','D','E','F','G']); }
	if(c==='7') { return(['A','B','C']); }
	if(c==='8') { return(['A','B','C','D','E','F','G']); }
	if(c==='9') { return(['A','B','C','D','F','G']); }
	if(c==='-') { return(['G']); }
};

winmine.insert_seven_segment_elements = function() {
	const seven_elements = ['counter0','counter1','counter2',
		'timer0','timer1','timer2'];
	for (let i = 0; i < seven_elements.length; i += 1) {
		winmine.sevseg.fill_seven_segment_container(seven_elements[i]);
	}
};

winmine.sevseg.assign_segments = function(container_html_id, position, new_number) {
	const counter_id = container_html_id + position;
	document.querySelectorAll('#' + counter_id + ' > div').forEach(function (element) {
		element.classList.remove('red7');
	});
	const segment_array = winmine.sevseg.get_segment_array(new_number);
	const css_selector = '#' + counter_id + ' > .' + segment_array.join('7, #' + counter_id + ' > .').concat('7');
	document.querySelectorAll(css_selector).forEach(function (element) {
		element.classList.add('red7');
	});
};

winmine.init_counter = function(mine_number) {
	mine_number = mine_number.toString().padStart(3, 0);
	for(let i = 0; i < mine_number.length; i += 1) {
		winmine.sevseg.assign_segments('counter', i, mine_number.charAt(i))
	}
	winmine.counter = mine_number;
};

winmine.init_timer = function() {
	const timer_value = '000';
	for(let i = 0; i < timer_value.length; i += 1) {
		winmine.sevseg.assign_segments('timer', i, timer_value.charAt(i))
	}
};

winmine.set_mine_counter = function(remaining_mines) {
	if(remaining_mines > 999) {
		remaining_mines = 999;
	}
	remaining_mines = remaining_mines.toString();
	if(remaining_mines.charAt(0) === '-') {
		remaining_mines = '-'.concat(remaining_mines.substring(1).padStart(2, '0'));
	} else {
		remaining_mines = remaining_mines.padStart(3, '0');
	}
	for(let i = 0; i < remaining_mines.length; i += 1) {
		if(remaining_mines.charAt(i) === winmine.counter.charAt(i)) {
			continue;
		} else {
			winmine.sevseg.assign_segments('counter', i, remaining_mines.charAt(i))
		}
	}
	winmine.counter = remaining_mines;
};

winmine.start_timer = function() {
	this.sleep = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};
	this.onmessage = async function(e) {
		let start_seconds = e.data;
		let delay_ms = parseInt(start_seconds) * 1000;
		/* look for a period because this worker function accepts fractional seconds (e.g. 4.205 from action replay).
		do this by showing the current integer second and sleeping the remaining partial-second difference, then showing the next integer */
		if(start_seconds.match(/\./g)) {
			const second_fraction = start_seconds.split('.');
			postMessage(second_fraction[0]);
			start_seconds = parseInt(second_fraction[0]) + 1 + '';
			const second_sub_ms = second_fraction[1];
			await sleep(1000 - parseInt(second_sub_ms, 10));
			delay_ms = parseInt(second_fraction[0] + second_fraction[1]);
		}
		/* first we show the asked-for seconds, then we kick off a while loop that sleeps for delay_ms each loop (e.g. 1000ms).
		the original asked-for seconds has to be added each time in the while loop because the loop uses performance.now() for precision
		which is absolute to the spawn of the worker (so we add what we asked for, e.g. 1 second or 460 seconds, relative to this, every time) */
		postMessage(start_seconds);
		while(true) {
			await sleep(1000);
			let since_start = performance.now(); /* time since worker started */
			since_start = since_start + delay_ms;
			since_start = Math.round(since_start/1000);
			postMessage(since_start.toString());
		}
	};
};
winmine.start_timer_function_text = '(' + winmine.start_timer.toString() + ')()';
winmine.start_timer_function_blob = new Blob([winmine.start_timer_function_text], {type: 'application/javascript'});

winmine.start_timer_worker = function(start_value) {
	winmine.timer_worker = new Worker(URL.createObjectURL(winmine.start_timer_function_blob));
	winmine.timer_worker.onmessage = function(event) {
		winmine.set_timer(event.data);
	};
	winmine.timer_worker.postMessage(start_value);
};

winmine.timer = '000';
winmine.set_timer = function(new_timer) {
	new_timer = new_timer.padStart(3, 0);
	for(let i = 0; i < 3; i += 1) {
		if(new_timer.charAt(i) === winmine.timer.charAt(i)) {
			continue;
		} else {
			winmine.sevseg.assign_segments('timer', i, new_timer.charAt(i))
		}
	}
	winmine.timer = new_timer;
	if(new_timer === '999') {
		winmine.timer_worker.terminate();
	}
};

winmine.post_to_api = async function(data) {
	try {
		/* force https or localhost */
		const api_url = (!/^https:\/\//.test(winmine.setting.api_url) && !/^localhost/.test(winmine.setting.api_url)) ? 'https://' + winmine.setting.api_url.replace(/http:\/\//, '') : winmine.setting.api_url;
		const meta = {
			browser_user_agent: navigator.userAgent,
			browser_language: navigator.language,
			browser_href: window.location.href,
			/* TODO: remove this variable if it seems useless */
			browser_referrer_origin: document.referrer.split(/\?height=|\?width=|\?mines=/)[0]
		};
		const post_data = Object.assign({}, meta, data);
		fetch(api_url, {
			method: 'POST',
			mode: 'no-cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(post_data),
		})
		.then(result => { /* console.log('fetch succeeded:', result); */ })
		.catch((e) => { /* console.warn('fetch failed:', e); */ });
	} catch(e) {
		/* console.warn('POST to API failed:', e); */
	}
};

/* smaller size data that we may want to reference for every record (e.g. game history stats) are stored in the key of localStorage key/value so we can more-quickly loop over just key names to parse data. larger size data are stored in the value of key/value so we can avoid using localStorage.getItem to parse over data unless necessary */
/* key: pipe-separated '|' string of items see winmine.localStorage_key_items */
/* value: JSON.stringify'ed array of items see winmine.localStorage_value_items */
winmine.save_record_name = function(name) {
	/* items in key and value aren't named. see winmine.localStorage_key_items and winmine.localStorage_value_items for order/definition. see winmine.i for retrieving their index */
	const storage_key_base =
		((winmine.game_win) ? 'w' : 'l') + '|' +
		('' + winmine.height + 'x' + winmine.width + '/' + winmine.mine_count) + '|' +
		winmine._3bv + '|' +
		winmine.game_clicks.filter(x => ['l'].includes(x[1])).length + '|' +
		winmine.game_clicks.filter(x => ['m'].includes(x[1])).length + '|' +
		winmine.game_clicks.filter(x => ['f','q','c'].includes(x[1])).length + '|' +
		winmine.flagged_cells.length + '|' +
		winmine.game_duration + '|' +
		winmine.game_end_time;
	const storage_key_old = storage_key_base + '|' + winmine.setting.player_name;
	const storage_key = storage_key_base + '|' + name.replace(/\||\r|\n|\t/g,''); /* don't allow special key name array separator character | or line breaks */
	const storage_value = JSON.stringify([winmine.mines_orig, (winmine.backup_y+'_'+winmine.backup_x), winmine.game_clicks]);
	winmine.localStorage.removeItem(storage_key_old);
	winmine.localStorage.setItem(storage_key, storage_value);

	/* for api */
	if(winmine.setting.use_api) {
		/* create named objects for json POST by mapping back to dictionaries winmine.localStorage_key_items and winmine.localStorage_value_items*/
		const storage_key_array = storage_key.split('|');
		const storage_key_named = Object.keys(winmine.localStorage_key_items).reduce((obj, key, index) => ({ ...obj, [key]: storage_key_array[index] }), {});
		const storage_value_array = JSON.parse(storage_value);
		const storage_value_named = Object.keys(winmine.localStorage_value_items).reduce((obj, key, index) => ({ ...obj, [key]: storage_value_array[index] }), {});
		const winmine_version = (document.head.querySelector("meta[name='version']") == null) ? 'unknown' : document.head.querySelector("meta[name='version']").content;
		const winmine_info = { app: 'winmine', version: winmine_version };
		const api_data = Object.assign({}, winmine_info, storage_key_named, storage_value_named);
		winmine.post_to_api(api_data);
	}

	return(storage_key);
};

winmine.save_record = function() {
	/* save immediately using configured default save name, then do follow-up best time / name-entry check */
	const saved_key_name = winmine.save_record_name(winmine.setting.player_name);
	if(winmine.game_win) {
		const game_config = '' + winmine.height + 'x' + winmine.width + '/' + winmine.mine_count;
		/* look through existing storage key names for (w)in records matching the game board config and check if current game time bests them all */
		let keys_to_search = winmine.localStorage.keys().filter(function(x) {
			return ('w' + x.split('|')[winmine.i('board')] === 'w' + game_config)
			& (x !== saved_key_name); /* exclude the game we just saved */
		});
		if([winmine.setting.beginner2, '16x16/40', '16x30/99'].includes(game_config)) {
			let best_times_cleared_on = winmine.localStorage.getItem('setting_best_times_cleared_on');
			best_times_cleared_on = (best_times_cleared_on === null) ? Date.parse('1990-01-01') : Date.parse(best_times_cleared_on);
			keys_to_search = keys_to_search.filter(x => Date.parse(x.split('|')[winmine.i('timestamp')]) > best_times_cleared_on);
		}
		let records_beat = 0;
		keys_to_search.forEach(function(x) {
			if(winmine.game_duration < parseInt(x.split('|')[winmine.i('duration')], 10)) {
				records_beat++;
			}
		});
		const is_best_time = records_beat === keys_to_search.length;
		if(is_best_time) {
			let difficulty = winmine.height + 'x' + winmine.width + '/' + winmine.mine_count + ' ';
			if(game_config === winmine.setting.beginner2)   { difficulty = 'Beginner'; }
			if(game_config === '16x16/40') { difficulty = 'Intermediate'; }
			if(game_config === '16x30/99') { difficulty = 'Expert'; }
			document.getElementsByClassName('content-best-time-game-header')[0].innerHTML = 'You have the fastest time\nfor ' + difficulty + ' level.\nPlease enter your name.';
			document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
			document.getElementsByClassName('content-best-time-game')[0].classList.add('content-best-time-game-enabled');
			document.querySelector('.content-best-time-game-input > input').select();
		}
	}
	/* clean up recent losses to some reasonable number */
	let losses_keys = winmine.localStorage.keys().filter(item => item.substring(0,2) === 'l|');
	if(losses_keys.length > 50) {
		let losses_ordered = losses_keys.map(item => item.split('|')[winmine.i('timestamp')]).sort().slice(0, 40);
		losses_keys.forEach(function(item) {
			if(losses_ordered.includes(item.split('|')[winmine.i('timestamp')])) {
				winmine.localStorage.removeItem(item);
			}
		});
	}
};

winmine.get_game_duration = function(round_to) {
	performance.mark('game_now');
	performance.measure('gm', 'game_start', 'game_now');
	const duration = (performance.getEntriesByName('gm')[0].duration / 1000).toFixed(round_to);
	performance.clearMarks('game_now');
	performance.clearMeasures('gm');
	return(duration);
};

winmine.id_as_y_x = function(id_string) {
	const as_array = id_string.substring(5).split('_');
	return([parseInt(as_array[0], 10), parseInt(as_array[1], 10)]);
};

/* for left+right click multi-cell visual styling */
winmine.get_array_of_neighbor_ids = function(y, x) {
	const neighbor_ids = [];
	if(y!=0 && x!=0) {
		neighbor_ids.push((y-1)+'_'+(x-1)); }
	if(y!=0) {
		neighbor_ids.push((y-1)+'_'+(x)); }
	if(y!=0 && x!=winmine.x_ceil) {
		neighbor_ids.push((y-1)+'_'+(x+1)); }
	if(x!=0) {
		neighbor_ids.push((y)+'_'+(x-1)); }
	if(x!=winmine.x_ceil) {
		neighbor_ids.push((y)+'_'+(x+1)); }
	if(y!=winmine.y_ceil && x!=0) {
		neighbor_ids.push((y+1)+'_'+(x-1)); }
	if(y!=winmine.y_ceil) {
		neighbor_ids.push((y+1)+'_'+(x)); }
	if(y!=winmine.y_ceil && x!=winmine.x_ceil) {
		neighbor_ids.push((y+1)+'_'+(x+1)); }
	return(neighbor_ids);
};

/* for assigning mines. attribution: https://stackoverflow.com/a/65440696/2100671 */
winmine.random = function(min, max) {
	const range = max - min + 1;
	const bits_needed = Math.ceil(Math.log2(range));
	const bytes_needed = Math.ceil(bits_needed / 8);
	const cutoff = Math.floor((256 ** bytes_needed) / range) * range;
	const bytes = new Uint8Array(bytes_needed);
	let value;
	do {
			crypto.getRandomValues(bytes);
			value = bytes.reduce((acc, x, n) => acc + x * 256 ** n, 0);
	} while (value >= cutoff) {
		return min + value % range;
	}
};

/* for applying noise to action replay cursor movements. attribution: https://github.com/blindman67/SimplexNoiseJS */
winmine.simplex_open = function(clientSeed) {
	const SQ3 = 1.7320508075688772;
	const toNums = (s) => s.split(",").map(s => new Uint8Array(s.split("").map(v => Number(v))));
	const decode = (m, r, s) => new Int8Array(s.split("").map(v => parseInt(v, r) + m));
	const NORM_2D = 1.0 / 47.0;
	const SQUISH_2D = (SQ3 - 1) / 2;
	const STRETCH_2D = (1 / SQ3 - 1) / 2;
	let base2D = toNums("110101000,110101211");
	const gradients2D = decode(-5, 11, "a77a073aa3700330");
	let lookupPairs2D = () => new Uint8Array([0,1, 1,0, 4,1, 17,0, 20,2, 21,2, 22,5, 23, 5,26, 4,39, 3,42, 4,43, 3]);
	let p2D = decode(-1, 4, "112011021322233123132111");
	const setOf = (count, cb = (i)=>i) => { let a = [], i = 0; while (i < count) { a.push(cb(i ++)) } return a };
	const doFor = (count, cb) => { let i = 0; while (i < count && cb(i++) !== true); };
	function shuffleSeed(seed, count = 1){
		seed = seed * 1664525 + 1013904223 | 0;
		count -= 1;
		return count > 0 ? shuffleSeed(seed, count) : seed;
	}
	const types = {
		_2D : {
			base : base2D,
			squish : SQUISH_2D,
			dimensions : 2,
			pD : p2D,
			lookup : lookupPairs2D,
		},
	};
	function createContribution(type, baseSet, index) {
		let i = 0;
		const multiplier = baseSet[index ++];
		const c = { next : undefined };
		while(i < type.dimensions){
			const axis = ("xyzw")[i];
			c[axis + "sb"] = baseSet[index + i];
			c["d" + axis] = - baseSet[index + i++] - multiplier * type.squish;
		}
		return c;
	};
	function createLookupPairs(lookupArray, contributions){
		const a = lookupArray();
		const res = new Map();
		for (let i = 0; i < a.length; i += 2) { res.set(a[i], contributions[a[i + 1]]) }
		return res;
	};
	function createContributionArray(type) {
		const conts = [];
		const d = type.dimensions;
		const baseStep = d * d;
		let k, i = 0;
		while (i < type.pD.length) {
			const baseSet = type.base[type.pD[i]];
			let previous, current;
			k = 0;
			do {
				current = createContribution(type, baseSet, k);
				if (!previous) { conts[i / baseStep] = current }
				else { previous.next = current }
				previous = current;
				k += d + 1;
			} while(k < baseSet.length);

			current.next = createContribution(type, type.pD, i + 1);
			i += baseStep;
		}
		const result = [conts, createLookupPairs(type.lookup, conts)];
		type.base = undefined;
		type.lookup = undefined;
		return result;
	};
	const [contributions2D, lookup2D] = createContributionArray(types._2D);
	const perm = new Uint8Array(256);
	const perm2D = new Uint8Array(256);
	const source = new Uint8Array(setOf(256, i => i));
	let seed = shuffleSeed(clientSeed, 3);
	doFor(256, i => {
		i = 255 - i;
		seed = shuffleSeed(seed);
		let r = (seed + 31) % (i + 1);
		r += r < 0 ? i + 1 : 0;
		perm[i] = source[r];
		perm2D[i] = perm[i] & 0x0E;
		source[r] = source[i];
	});
	base2D = undefined;
	lookupPairs2D = undefined;
	p2D = undefined;
	return {
		noise2D(x, y) {
			const pD = perm2D;
			const p = perm;
			const g = gradients2D;
			const stretchOffset = (x + y) * STRETCH_2D;
			const xs = x + stretchOffset, ys = y + stretchOffset;
			const xsb = Math.floor(xs), ysb = Math.floor(ys);
			const squishOffset	= (xsb + ysb) * SQUISH_2D;
			const dx0 = x - (xsb + squishOffset), dy0 = y - (ysb + squishOffset);
			let c = (() => {
				const xins = xs - xsb, yins = ys - ysb;
				const inSum = xins + yins;
				return lookup2D.get(
					(xins - yins + 1) |
					(inSum << 1) |
					((inSum + yins) << 2) |
					((inSum + xins) << 4)
				);
			})();
			let i, value = 0;
			while (c !== undefined) {
				const dx = dx0 + c.dx;
				const dy = dy0 + c.dy;
				let attn = 2 - dx * dx - dy * dy;
				if (attn > 0) {
					i = pD[(p[(xsb + c.xsb) & 0xFF] + (ysb + c.ysb)) & 0xFF];
					attn *= attn;
					value += attn * attn * (g[i++] * dx + g[i] * dy);
				}
				c = c.next;
			}
			return value * NORM_2D;
		},
	}
};

/* for replacing cell values when a mine is moved (first click) */
winmine.get_neighbor_mine_freq = function(y, x) {
	let num = 0;
	if(y!=0 && x!=0 && winmine.cells[y-1][x-1]==9) {
		num++; }
	if(y!=0 && winmine.cells[y-1][x]==9) {
		num++; }
	if(y!=0 && x!=winmine.x_ceil && winmine.cells[y-1][x+1]==9) {
		num++; }
	if(x!=0 && winmine.cells[y][x-1]==9) {
		num++; }
	if(x!=winmine.x_ceil && winmine.cells[y][x+1]==9) {
		num++; }
	if(y!=winmine.y_ceil && x!=0 && winmine.cells[y+1][x-1]==9) {
		num++; }
	if(y!=winmine.y_ceil && winmine.cells[y+1][x]==9) {
		num++; }
	if(y!=winmine.y_ceil && x!=winmine.x_ceil && winmine.cells[y+1][x+1]==9) {
		num++; }
	return(num);
};
/* for replacing cell values when a mine is moved (first click) */
winmine.update_neighbors = function(y, x) {
	if(y!=0 && x!=0 && winmine.cells[y-1][x-1]!=9) {
		winmine.cells[y-1][x-1] = winmine.get_neighbor_mine_freq(y-1,x-1); }
	if(y!=0 && winmine.cells[y-1][x]!=9) {
		winmine.cells[y-1][x] = winmine.get_neighbor_mine_freq(y-1,x); }
	if(y!=0 && x!=winmine.x_ceil && winmine.cells[y-1][x+1]!=9) {
		winmine.cells[y-1][x+1] = winmine.get_neighbor_mine_freq(y-1,x+1); }
	if(x!=0 && winmine.cells[y][x-1]!=9) {
		winmine.cells[y][x-1] = winmine.get_neighbor_mine_freq(y,x-1); }
	if(x!=winmine.x_ceil && winmine.cells[y][x+1]!=9) {
		winmine.cells[y][x+1] = winmine.get_neighbor_mine_freq(y,x+1); }
	if(y!=winmine.y_ceil && x!=0 && winmine.cells[y+1][x-1]!=9) {
		winmine.cells[y+1][x-1] = winmine.get_neighbor_mine_freq(y+1,x-1); }
	if(y!=winmine.y_ceil && winmine.cells[y+1][x]!=9) {
		winmine.cells[y+1][x] = winmine.get_neighbor_mine_freq(y+1,x); }
	if(y!=winmine.y_ceil && x!=winmine.x_ceil && winmine.cells[y+1][x+1]!=9) {
		winmine.cells[y+1][x+1]  = winmine.get_neighbor_mine_freq(y+1,x+1); }
};

/* for 3BV. TODO: this hits a recursion/max-thread threshold in browsers at some point around 8,000+ cells */
winmine.flood_fill = function(y, x) {
	winmine.cell_count--;
	const value = winmine.c[y][x];
	winmine.c[y][x] = -1;
	if(value == 0) {
		if(y!=0 && x!=0 && winmine.c[y-1][x-1]!=-1) {
			winmine.flood_fill(y-1,x-1); }
		if(y!=0 && winmine.c[y-1][x]!=-1) {
			winmine.flood_fill(y-1,x); }
		if(y!=0 && x!=winmine.x_ceil && winmine.c[y-1][x+1]!=-1) {
			winmine.flood_fill(y-1,x+1); }
		if(x!=0 && winmine.c[y][x-1]!=-1) {
			winmine.flood_fill(y,x-1); }
		if(x!=winmine.x_ceil && winmine.c[y][x+1]!=-1) {
			winmine.flood_fill(y,x+1); }
		if(y!=winmine.y_ceil && x!=0 && winmine.c[y+1][x-1]!=-1) {
			winmine.flood_fill(y+1,x-1); }
		if(y!=winmine.y_ceil && winmine.c[y+1][x]!=-1) {
			winmine.flood_fill(y+1,x); }
		if(y!=winmine.y_ceil && x!=winmine.x_ceil && winmine.c[y+1][x+1]!=-1) {
			winmine.flood_fill(y+1,x+1); }
	}
};

winmine.set_3bv = function() {
	winmine.c = JSON.parse(JSON.stringify(winmine.cells)); /* make a copy for this */
	winmine.cell_count = (winmine.height * winmine.width) - winmine.mine_count;
	winmine._3bv = 0;
	for (let i = 0; i < winmine.height; ++i) {
		for (let j = 0; j < winmine.width; ++j) {
			if(winmine.c[i][j] == 0) {
				winmine._3bv++;
				winmine.flood_fill(i, j);
			}
		}
	}
	winmine._3bv = winmine.cell_count + winmine._3bv;
	delete winmine.c;
	delete winmine.cell_count;
};

winmine.clear_mine_field = function(y, x) {
	const value = winmine.cells[y][x];
	if(value > 8) {
		return;
	}
	winmine.cleared++;
	winmine.cells[y][x] = -1;
	const cell_element = document.getElementById('cell_'+y+'_'+x);
	if(value > 0) {
		cell_element.classList.add('clear');
		cell_element.classList.add('c' + value);
		return;
	}
	if(value == 0) {
		cell_element.classList.add('clear');
		if(y!=0 && x!=0 && winmine.cells[y-1][x-1]!=-1) {
			winmine.clear_mine_field(y-1,x-1); }
		if(y!=0 && winmine.cells[y-1][x]!=-1) {
			winmine.clear_mine_field(y-1,x); }
		if(y!=0 && x!=winmine.x_ceil && winmine.cells[y-1][x+1]!=-1) {
			winmine.clear_mine_field(y-1,x+1); }
		if(x!=0 && winmine.cells[y][x-1]!=-1) {
			winmine.clear_mine_field(y,x-1); }
		if(x!=winmine.x_ceil && winmine.cells[y][x+1]!=-1) {
			winmine.clear_mine_field(y,x+1); }
		if(y!=winmine.y_ceil && x!=0 && winmine.cells[y+1][x-1]!=-1) {
			winmine.clear_mine_field(y+1,x-1); }
		if(y!=winmine.y_ceil && winmine.cells[y+1][x]!=-1) {
			winmine.clear_mine_field(y+1,x); }
		if(y!=winmine.y_ceil && x!=winmine.x_ceil && winmine.cells[y+1][x+1]!=-1) {
			winmine.clear_mine_field(y+1,x+1); }
	}
};

winmine.create_mine_field = function() {
	/* 2d integer array cells[row][col] */
	winmine.cells = [];
	const cell_container = document.getElementsByClassName('cell-container')[0];
	for (let row = 0; row < winmine.height; row += 1) {
		winmine.cells.push(row);
		winmine.cells[row] = [];
		for (let col = 0; col < winmine.width; col += 1) {
			winmine.cells[row].push(0);
			/* create html grid div cells for .cell_container */
			const cell_div = document.createElement('div');
			cell_div.id = 'cell_'+row+'_'+col;
			cell_container.append(cell_div);
		}
	}
	/* define html grid for .cell-container */
	const grid_template_rows = 'auto '.repeat(winmine.height);
	const grid_template_columns = 'auto '.repeat(winmine.width);
	cell_container.style.setProperty('grid-template-rows', grid_template_rows);
	cell_container.style.setProperty('grid-template-columns', grid_template_columns);

	/* create mine array if not already created for action replay */
	winmine.mines = (winmine.replay_mode | winmine.play_again_mode) ? winmine.mines : []; /* replay behavior was thrown in here late and could be better organized (right now setting winmine.cells in the same for loop as filling winmine.mines even though winmine.mines may already be set in replay mode) */
	winmine.y_ceil = winmine.height - 1;
	winmine.x_ceil = winmine.width - 1;
	for(let mine = 0; winmine.mines.length < (winmine.mine_count+1); mine += 1) { /* +1 for the backup mine */
		let y = winmine.random(0,(winmine.height-1));
		let x = winmine.random(0,(winmine.width-1));
		y = (winmine.replay_mode | winmine.play_again_mode) ? parseInt(winmine.mines[mine].split('_')[0]) : y;
		x = (winmine.replay_mode | winmine.play_again_mode) ? parseInt(winmine.mines[mine].split('_')[1]) : x;
		if(!winmine.replay_mode & !winmine.play_again_mode) {
			if(winmine.mines.includes(y+'_'+x)) {
				continue;
			} else {
				if(winmine.mines.length == (winmine.mine_count)) {
					/* stash one random backup mine to support first-click-is-free rule */
					winmine.backup_y = y;
					winmine.backup_x = x;
					break;
				} else {
					winmine.mines.push(y+'_'+x);
				}
			}
		}
		if(winmine.cells[y][x] != 9) {
			winmine.cells[y][x] = 9;
			/* set neighbor mine frequency values now (overlaps repeat ++increment) so that we can reference the board values instead of computing during play */
			if(y!=0 && x!=0 && winmine.cells[y-1][x-1]!=9) {
				winmine.cells[y-1][x-1]++; }
			if(y!=0 && winmine.cells[y-1][x]!=9) {
				winmine.cells[y-1][x]++; }
			if(y!=0 && x!=winmine.x_ceil && winmine.cells[y-1][x+1]!=9) {
				winmine.cells[y-1][x+1]++; }
			if(x!=0 && winmine.cells[y][x-1]!=9) {
				winmine.cells[y][x-1]++; }
			if(x!=winmine.x_ceil && winmine.cells[y][x+1]!=9) {
				winmine.cells[y][x+1]++; }
			if(y!=winmine.y_ceil && x!=0 && winmine.cells[y+1][x-1]!=9) {
				winmine.cells[y+1][x-1]++; }
			if(y!=winmine.y_ceil && winmine.cells[y+1][x]!=9) {
				winmine.cells[y+1][x]++; }
			if(y!=winmine.y_ceil && x!=winmine.x_ceil && winmine.cells[y+1][x+1]!=9) {
				winmine.cells[y+1][x+1]++; }
		}
		if((winmine.replay_mode | winmine.play_again_mode) & (mine >= (winmine.mine_count-1))) {
			break;
		}
	}
	winmine.mines_orig = winmine.mines.slice(0); /* copy for saving */
};

winmine.choose_cell = function(cell_html_id) {
	if(!winmine.game_started) {
		performance.mark('game_start');
		winmine.start_timer_worker('1'); /* winmine version starts at 1 */
		winmine.game_started = true;
		/* add pre-gameplay actions flags/question-marks to game_clicks so it's stored with history */
		if(winmine.flagged_cells.length !== 0) {
			winmine.game_clicks = winmine.flagged_cells.map(item=>['-1','f',item]);
		}
		if(winmine.marked_cells !== 0) {
			const new_actions = winmine.marked_cells.map(item=>['-1','q',item]);
			winmine.game_clicks = winmine.game_clicks.concat(new_actions);
		}
	}
	const cell_element = document.getElementById(cell_html_id);
	if(cell_element.classList.contains('clear')) {
		return;
	}
	cell_element.classList.add('clear');
	const coords = winmine.id_as_y_x(cell_html_id);
	const y = coords[0];
	const x = coords[1];
	const cell_id_string = y+'_'+x;

/* 	const game_click_code = (winmine.multi_cell) ? 'm': 'l';
	const clicked_cell_id_string = (winmine.multi_cell) ? multi_cell_html_id.substring(5) : cell_id_string;
	winmine.game_clicks.push([winmine.get_game_duration(1), game_click_code, clicked_cell_id_string]); */
	
	/* 1. consider loss, if cell is a mine and at least one cell has been chosen (not first click) */
	if(winmine.cells[y][x] == 9) {
		if(winmine.cleared > 0) {
			winmine.game_duration = (winmine.replay_mode) ? winmine.game_duration : winmine.get_game_duration(3);
			winmine.timer_worker.terminate();
			winmine.game_over = true;
			winmine.game_win = false;
			winmine.game_end_time = (new Date(Date.now())).toISOString();
			cell_element.classList.add('triggered-mine');
			const smiley_frame = document.getElementsByClassName('smiley-container')[0];
			smiley_frame.classList.remove('face-neutral');
			smiley_frame.classList.add('face-game-over');
			for (let i = 0; i < winmine.mines.length; i += 1) {
				if(!winmine.flagged_cells.includes(winmine.mines[i])) {
					const mine_cell = document.getElementById('cell_' + winmine.mines[i]);
					mine_cell.classList.remove('question');
					mine_cell.classList.add('clear','mine');
				}
			}
			const incorrectly_flagged = winmine.flagged_cells.filter(id => !winmine.mines.includes(id));
			for (let i = 0; i < incorrectly_flagged.length; i += 1) {
				const elem_id = incorrectly_flagged[i];
				const elem = document.getElementById('cell_' + elem_id);
				elem.classList.remove('flag');
				elem.classList.add('notmine');
			}
			document.getElementsByClassName('scoreboard-digits-container')[1].title = winmine.game_duration;
			winmine.update_game_over_menu();
			if(!winmine.replay_mode) {
				winmine.save_record();
			}
			return;
		} else {
			/* replace mine in 1d array */
			const idx = winmine.mines.indexOf(cell_id_string);
			winmine.mines[idx] = winmine.backup_y+'_'+winmine.backup_x;
			/* replace mine in cells board */
			winmine.cells[winmine.backup_y][winmine.backup_x] = 9;
			winmine.cells[y][x] = winmine.get_neighbor_mine_freq(y, x);
			/* update cells board neighbor values */
			winmine.update_neighbors(y, x);
			winmine.update_neighbors(winmine.backup_y, winmine.backup_x);
			/* recalc 3bv */
			winmine.set_3bv();
		}
	}

	/* 2. use the same recursion method used to get 3BV and set the 1-9 image css classes */
	winmine.clear_mine_field(y, x);

	/* 3. consider win */
	if(winmine.cleared >= (winmine.height*winmine.width-winmine.mine_count)) {
		winmine.game_duration = (winmine.replay_mode) ? winmine.game_duration : winmine.get_game_duration(3);
		winmine.timer_worker.terminate();
		winmine.game_over = true;
		winmine.game_win = true;
		winmine.game_end_time = (new Date(Date.now())).toISOString();
		const smiley_frame = document.getElementsByClassName('smiley-container')[0];
		smiley_frame.classList.remove('face-neutral');
		smiley_frame.classList.add('face-game-win');
		const unflagged_mines = winmine.mines.filter(m => !winmine.flagged_cells.includes(m));
		for (const unflagged_mine of unflagged_mines) {
			const elem = document.getElementById('cell_' + unflagged_mine);
			elem.classList.add('flag');
		}
		document.getElementsByClassName('scoreboard-digits-container')[1].title = winmine.game_duration;
		winmine.set_mine_counter(0);
		if(!winmine.replay_mode) {
			winmine.save_record();
		}
		winmine.update_game_over_menu();
	}
};

winmine.flag_cell = function(cell_html_id) {
	const cell_id_string = cell_html_id.substring(5);
	const coords = winmine.id_as_y_x(cell_html_id);
	const cell_element = document.getElementById(cell_html_id);
	const is_flagged = cell_element.classList.contains('flag');
	const is_marked = cell_element.classList.contains('question') && winmine.setting.marks;
	let action_code;
	if(!is_flagged && !is_marked) {
		cell_element.classList.add('flag');
		winmine.flagged_cells.push(cell_id_string);
		action_code = 'f';
		/* so that clear_mine_field() can treat flags like mines, give board a value that it will ignore. we set this back if cell is unflagged */
		if(winmine.cells[coords[0]][coords[1]] != 9) {
			winmine.cells[coords[0]][coords[1]] = 10;
		}
	} else if(is_flagged) {
		cell_element.classList.remove('flag');
		winmine.flagged_cells = winmine.flagged_cells.filter(item => item !== cell_id_string);
		if(winmine.setting.marks) {
			cell_element.classList.add('question');
			winmine.marked_cells.push(cell_id_string);
			action_code = 'q';
		} else {
			action_code = 'c';
		}
		if(winmine.cells[coords[0]][coords[1]] != 9) {
			winmine.cells[coords[0]][coords[1]] = winmine.get_neighbor_mine_freq(coords[0],coords[1]);
		}
	} else if(is_marked) {
		cell_element.classList.remove('question');
		action_code = 'c';
		winmine.marked_cells = winmine.marked_cells.filter(item => item !== cell_id_string);
	}
	if(winmine.game_clicks.length !== 0) {
		winmine.game_clicks.push([winmine.get_game_duration(1), action_code, cell_id_string]);
	}
	winmine.set_mine_counter(winmine.mine_count - winmine.flagged_cells.length);
};

/* Menu feature items */
winmine.set_file_menu_item_marks = function() {
	let game_is_custom = true;
	if(winmine.height === winmine.setting.beginner[0] && winmine.width === winmine.setting.beginner[1] && winmine.mine_count === winmine.setting.beginner[2]) {
		document.querySelector('.menu-item[data-name=\'Beginner\']').classList.add('menu-mark');
		game_is_custom = false;
	}
	if(winmine.height === 16 && winmine.width === 16 && winmine.mine_count === 40) {
		document.querySelector('.menu-item[data-name=\'Intermediate\']').classList.add('menu-mark');
		game_is_custom = false;
	}
	if(winmine.height === 16 && winmine.width === 30 && winmine.mine_count === 99) {
		document.querySelector('.menu-item[data-name=\'Expert\']').classList.add('menu-mark');
		game_is_custom = false;
	}
	if(game_is_custom) {
		document.querySelector('.menu-item[data-name=\'Custom...\']').classList.add('menu-mark');
	}
	if(winmine.setting.marks) {
		document.querySelector('.menu-item[data-name=\'Marks (?)\']').classList.add('menu-mark');
	}
	if(winmine.setting.color) {
		document.querySelector('.menu-item[data-name=\'Color\']').classList.add('menu-mark');
	} else {
		document.documentElement.style.setProperty('filter', 'grayscale(100%)');
	}
	if(winmine.setting.extra_menu) {
		document.querySelector('.menu-item[data-name=\'Extra Menu*\']').classList.add('menu-mark');
		document.getElementsByClassName('extra-menu-frame')[0].classList.add('display-inline-block');
		document.getElementsByClassName('extra-replay-menu-frame')[0].classList.add('display-inline-block');
	}
};

winmine.get_most_common_item_in_array = function(arr) {
	let max_count = 1;
	let freq = 0;
	let max_item;
	for (let i=0; i<arr.length; i++)
	{
		for (let j=i; j<arr.length; j++)
		{
			if (arr[i] == arr[j]) {
				freq++;
			}
			if (max_count < freq)
			{
				max_count = freq; 
				max_item = arr[i];
			}
		}
		freq = 0;
	}
	return(max_item);
};

/* for game history table sorting. attribution: https://stackoverflow.com/a/42080550/2100671 */
winmine.sort_table = function(tbody, index) {
	winmine.sort_table_col_idx = index;
	if(winmine.sort_table_asc) {
		winmine.sort_table_asc = false;
	} else {
		winmine.sort_table_asc = true;
	}
	const row_list = [];
	let tbody_length = tbody.rows.length;
	for(let i = 0; i < tbody_length; i++){
		row_list[i] = tbody.rows[i];
	}
	row_list.sort(winmine.sort_table_cells);
	for(let i = 0; i < tbody_length; i++){
		tbody.appendChild(row_list[i]);
	}
};
winmine.sort_table_cells = function(_a,_b) {
	let a = _a.cells[winmine.sort_table_col_idx];
	let b = _b.cells[winmine.sort_table_col_idx];
	a = ((a.hasAttribute('data-sort-value')) ? a.getAttribute('data-sort-value') : a.innerText);
	b = ((b.hasAttribute('data-sort-value')) ? b.getAttribute('data-sort-value') : b.innerText);
	a = a.replace(/\,/g, '');
	b = b.replace(/\,/g, '');
	if(winmine.sort_table_asc) {
		let temp = a;
		a = b;
		b = temp;
	}
	if(a.match(/^-?[0-9]\d*(\.\d+)?$/) && b.match(/^-?[0-9]\d*(\.\d+)?$/)) {
			return parseFloat(a) - parseFloat(b);
	}	else {
		if (a < b) {
			return -1; 
		} else if (a > b) {
			return 1; 
		} else {
			return 0;       
		}         
	}
};

/* localStorage game history variable definition (with example values) */
/* this defines the order for how data is saved to localStorage and saved/imported for csv, important because data items/objects aren't named when saved to localStorage, we get them by index */
/* see winmine.i() examples for help writing value lookups by referencing the index by name in case things change */
winmine.localStorage_key_items = {
	'result': 'w',
	'board': '8x8/10',
	'3bv': '4',
	'left_clicks': '2',
	'multi_clicks': '1',
	'right_clicks': '3',
	'flags_used': '3',
	'duration': '5.305',
	'timestamp': '2021-04-15T14:35:57.299Z',
	'name': 'Anonymous'
};
winmine.localStorage_value_items = {
	'mines': '["2_5","1_5","2_7","1_6","5_2","0_7","1_7","4_5","0_0","2_6"]',
	'backup_mine': '0_1',
	'action_replay': '[["0.0","l","0_6"],["0.3","l","3_6"],["0.5","l","4_4"],["0.7","l","3_2"],["2.0","f","5_2"],["2.9","f","4_5"],["3.4","m","3_5"],["3.8","f","2_5"],["4.7","f","1_5"],["5.3","m","0_5"]]'
};
winmine.i = function(itemname, kv = 'key') {
	if(kv === 'key') {
		return(Object.keys(winmine.localStorage_key_items).indexOf(itemname));
	} else {
		return(Object.keys(winmine.localStorage_value_items).indexOf(itemname));
	}
};
winmine.save_game_history = function() {
	let csv_content = 'data:text/csv;charset=utf-8,';
	const header = Object.keys(winmine.localStorage_key_items).join(',') + ',' + Object.keys(winmine.localStorage_value_items).join(',');
	csv_content += header + '\r\n';
	const select_element = document.getElementsByClassName('content-game-history-select')[0];
	const winning_keys = (select_element.value == 'losses') ? winmine.localStorage.keys().filter(x => ['w|','l|'].includes(x.substring(0,2))) : winmine.localStorage.keys().filter(x => x.substring(0,2)==='w|');
	winning_keys.forEach(function(key_name) {
		let key_items = key_name.split('|');
		/* construct csv, escape double quotes */
		key_items = key_items.map(function(item) { return('\"' + item.replace(/"/g, '\"\"') + '\"'); }).join(',');
		let value_items =	JSON.parse(winmine.localStorage.getItem(key_name));
		/* JSON.stringify any variable not already a string (our big array items) */
		value_items = value_items.map(function(item) { item = (typeof item === 'string') ? item : JSON.stringify(item); return('\"' + item.replace(/"/g, '\"\"') + '\"'); }).join(',');
		const row = key_items + ',' + value_items;
		csv_content += row + "\r\n";
	});
	const encoded_uri = encodeURI(csv_content);
	const link = document.createElement('a');
	link.setAttribute('href', encoded_uri);
	link.setAttribute('download', 'winmine_history.csv');
	document.body.appendChild(link);
	link.click();
};
/* generic csv parser */
winmine.read_csv = function(csv) {
  const arr = [];
  let in_quote = false;
  for(let row = 0, col = 0, c = 0; c < csv.length; c++) {
    const cc = csv[c];
		const nc = csv[c+1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if(in_quote && cc == '"' && nc == '"') {
			arr[row][col] += cc;
			c++;
			continue;
		}
    if(cc == '"') {
			in_quote = !in_quote;
			continue;
		}
    if(!in_quote && cc == ',') {
			col++;
			continue;
		}
    if (!in_quote && cc == '\r' && nc == '\n') {
			col = 0;
			row++;
			c++;
			continue;
		}
    if (!in_quote && (cc == '\n' || cc == '\r')) {
			col = 0;
			row++;
			continue;
		}
    arr[row][col] += cc;
  }
	return(arr);
};
winmine.import_game_history = function(csv) {
	const game_history = winmine.read_csv(csv);
	let header = game_history[0];
	let not_header = game_history.slice(1);
	/* first we need to check the header and that it contains the names/columns we need */
	header = header.map(function(x) { return x.toLowerCase().trim() }); /* clean for comparing */
	const variables_in_key_name = Object.keys(winmine.localStorage_key_items);
	const variables_in_key_value = Object.keys(winmine.localStorage_value_items);
	const expected_column_names = variables_in_key_name.concat(variables_in_key_value);
	for(const column_name of expected_column_names) {
		if(!header.includes(column_name)) {
			alert('❌ Error with csv: column \'' + column_name + '\' not found. \n\nThe following columns must exist:\n' + expected_column_names.join(', '));
			return;
		}
	}
	/* save each row with appropriate localStorage.setItem convention */
	for(const row of not_header) {
		const things_to_save = [];
		for(const column of expected_column_names) {
			things_to_save.push(row[header.indexOf(column)]);
		}
		const localStorage_key_things = things_to_save.slice(0, (variables_in_key_name.length));
		const localStorage_item_things = things_to_save.slice(variables_in_key_name.length, expected_column_names.length).map(function(x) {
			/* check for and parse arrays */
			if(x.charAt(0) === '[') {
				return JSON.parse(x);
			} else {
				return x;
			}
		});
		winmine.localStorage.setItem(localStorage_key_things.join('|'), JSON.stringify(localStorage_item_things));
	}
	/* trigger a close-reopen of the game history menu content for a refresh effect */
	document.querySelector('.content-game-history .content-escape-button').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	document.querySelector('[data-name="Game History"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	alert('✔️ ' + not_header.length + ' game records imported')
};

winmine.fill_game_history_table = function(tbody, select_option_value) {
	tbody.textContent = ''; /* keep it simple and just delete all the table records each new request */
	let hist = winmine.hist;
	/* check for board pattern of NxN/M */
	if(select_option_value.match(/x|\//g) != null) {
		hist = hist.filter(item => item[0] === 'w' & item[1] === select_option_value);
	} else if(select_option_value === 'all') {
		hist = hist.filter(item => item[0] === 'w');
	} else if(select_option_value === 'losses') {
		hist = hist.filter(item => item[0] === 'l');
	}
	if(hist.length === 0) {
		document.getElementsByClassName('content-game-history-no-history')[0].classList.add('content-game-history-no-history-enabled');
	} else {
		document.getElementsByClassName('content-game-history-no-history')[0].classList.remove('content-game-history-no-history-enabled');
	}
	for (let i = 0; i < hist.length; i++) {
		const h = hist[i];
		/* name items for sanity */
		const board = h[winmine.i('board')];
		const _3bv = h[winmine.i('3bv')];
		const clicks = parseInt(h[winmine.i('left_clicks')], 10) + parseInt(h[winmine.i('multi_clicks')], 10);
		const time = h[winmine.i('duration')];
		const datetime = h[winmine.i('timestamp')];
		tbody.insertRow(-1);
		const new_row = tbody.rows[i];
		new_row.insertCell(0);
		new_row.cells[0].innerHTML = board;
		new_row.insertCell(1);
		new_row.cells[1].innerHTML = _3bv;
		new_row.cells[1].title = clicks + ' / ' + _3bv;
		new_row.insertCell(2);
		new_row.cells[2].innerHTML = parseFloat(time).toFixed(3);
		new_row.insertCell(3);
		new_row.cells[3].innerHTML = new Date(datetime).toLocaleDateString('en-US', {	day: 'numeric',	month: 'numeric',	year: '2-digit', });
		new_row.cells[3].title = new Date(datetime).toLocaleTimeString();
		new_row.cells[3].setAttribute('data-sort-value', datetime);
		new_row.insertCell(4);
		new_row.cells[4].innerHTML = (_3bv / time).toFixed(2);
		new_row.insertCell(5);
		new_row.cells[5].innerHTML = (time / (_3bv / time)).toFixed(0);
	}

	/* do some visual hiding/minifying of columns for small boards */
	if(window.innerWidth < 230) {
		/* hide performance columns to the right */
		document.querySelectorAll(
			'.content-game-history-table table thead tr:nth-child(1) th:nth-child(n+5),' +
			'.content-game-history-table table thead tr:nth-child(2) th,' +
			'.content-game-history-table table tbody tr td:nth-child(n+5)'
		).forEach(function(x) {
			x.classList.add('display-none');
		});
	}
	if(window.innerWidth < 175) {
		/* minify Boards column */
		document.querySelectorAll('.content-game-history-table table thead tr:nth-child(1) th:nth-child(1)').forEach(function(x) {
			x.innerText = 'B';
			x.title = 'Board';
		});
		document.querySelectorAll('.content-game-history-table table tbody tr td:nth-child(1)').forEach(function(x) {
			x.title = x.innerText;
			x.setAttribute('data-sort-value', x.innerText);
			x.innerText = '*';
		});
	}
	if(window.innerWidth < 164) {
		document.querySelectorAll('.content-game-history-table table tbody td').forEach(function(x) {
			x.style.padding = '3px';
		});
	}
};

/* for getting line points between clicked cells to apply noise to. attribution: https://stackoverflow.com/a/4672319/2100671 */
winmine.get_line = function(y0, x0, y1, x1) {
	const points = [];
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = (x0 < x1) ? 1 : -1;
	const sy = (y0 < y1) ? 1 : -1;
	let err = dx - dy;
	while(true) {
		points.push([x0, y0]);
		 if ((x0 === x1) && (y0 === y1)) break;
		 const e2 = 2*err;
		 if (e2 > -dy) { err -= dy; x0  += sx; }
		 if (e2 < dx) { err += dx; y0  += sy; }
	}
	return(points);
};

winmine.animate_cursor = function(cursor, start_sec, end_sec, start_y, start_x, end_y, end_x) {
	/*
	Two factors affect cursor movemment currently. The combination of the two can create a natural-ish cursor simulation if you play around. You can also create very jittery unnatural movements.
	1. the noise formula being applied to coordinates. currently we make it return a positive number between 0 and 1, and then multiply by N pixels
	2. the reducing of pixels we care to animate. currently keeping every 8th pixel seems the smoothest and I don't really understand why, but at least it's a less intense frequency than 1 or 2 pixels
	Note: To remove the slow-moving behavior that isn't realistic for clicks that take a bit of thinking, I think we should try a technique where we delay the movement to the next point until a minimum rate that looks good. In that delay period, instead add noise-ish coordinates that give a hover effect around last clicked cell
	*/
	const coordinates = winmine.get_line(start_y, start_x, end_y, end_x);
	let noise_coordinates = coordinates.map(function(coords, index) {
		return([
			/* 1 */
			coords[0] + (((winmine.simplex.noise2D(0, index*1) + 1) / 2) * 3.5),
			coords[1] + (((winmine.simplex.noise2D(1, index*1) + 1) / 2) * 3.5)
		])
	});
	noise_coordinates = noise_coordinates.filter((element, index) => {
		/* keep first and last point to avoid jitter */
		if(index == 0 || index == noise_coordinates.length-1) {
			return true;
		}
		/* 2 */
		return index % 8 === 0;
	});
	const delay_ms = (end_sec*1000) - (start_sec*1000);
	const loop_length = noise_coordinates.length-1;
	const loop_interval_ms = Math.floor(delay_ms / loop_length);
	let loop_rolling_ms = 0;
	let loop_counter = 0;
	while (loop_counter < loop_length) {
		setTimeout(function(_loop_counter) {
			cursor.animate(
				[{ transform: 'translateY(' + noise_coordinates[_loop_counter][1] + 'px)' + ' translateX(' + noise_coordinates[_loop_counter][0] + 'px)' },
				 { transform: 'translateY(' + noise_coordinates[_loop_counter+1][1] + 'px)' + ' translateX(' + noise_coordinates[_loop_counter+1][0] + 'px)' }],
				{
					duration: loop_interval_ms,
					easing: 'linear',
					fill: 'forwards',
				},
			);
		}, loop_rolling_ms, loop_counter);
		loop_rolling_ms = loop_rolling_ms + loop_interval_ms;
		loop_counter++;
	}
};

winmine.replay_game = function() {
	winmine.replay_action_idx = winmine.replay_action_idx || 0; /* ongoing counter for pause/play, set on setTimeout success */
	winmine.replay_setTimeout = []; /* push setTimeout calls here so we can clear them when pause is selected by user */
	let replay_action_duration = 0; /* get sum of time passed from every action up until the one last paused on */
	winmine.simplex = winmine.simplex_open(Date.now()); /* cursor noise */
	for (let i = 0; i < winmine.replay_action_idx; i++) {
		replay_action_duration = replay_action_duration + (parseFloat(winmine.action_replay[i+1][0], 10) - parseFloat(winmine.action_replay[i][0], 10));
	}
	/* make replay support pre-gameplay flags/question-marks */
	if(winmine.replay_action_idx === 0) {
		for(let i = 0; i < winmine.action_replay.length; i++) {
			if(winmine.action_replay[i][0] === '-1') {
				const elem = document.getElementById('cell_'+winmine.action_replay[i][2]);
				const coords = winmine.id_as_y_x(elem.id);
				if(winmine.action_replay[i][1] === 'f') {
					elem.classList.add('flag');
					winmine.flagged_cells.push(winmine.action_replay[i][2]);
					if(winmine.cells[coords[0]][coords[1]] != 9) {
						winmine.cells[coords[0]][coords[1]] = 10;
					}
				} else if(winmine.action_replay[i][1] === 'q') {
					elem.classList.add('question');
					winmine.marked_cells.push(winmine.action_replay[i][2]);
					if(winmine.cells[coords[0]][coords[1]] != 9) {
						winmine.cells[coords[0]][coords[1]] = winmine.get_neighbor_mine_freq(coords[0],coords[1]);
					}
				}
			} else {
				winmine.action_start_idx = i;
				break;
			}
		}
		winmine.pre_action_replay = winmine.action_replay.slice(0, winmine.action_start_idx);
		winmine.action_replay = winmine.action_replay.slice(winmine.action_start_idx);
	}
	const action_count = winmine.action_replay.length;
	const cursor = document.getElementsByClassName('replay-cursor')[0];
	cursor.style.display = 'block';
	let curr_y = undefined;
	let curr_x = undefined;
	let next_y = undefined;
	let next_x = undefined;
	for (let i = winmine.replay_action_idx; i < action_count; i++) {
		const action = winmine.action_replay[i];
		const action_delay = (action[0]*1000) - (replay_action_duration*1000);
		const next_action = (i < action_count-1) ? winmine.action_replay[i+1] : action;
		const curr_cell = document.getElementById('cell_' + action[2]);
		const next_cell = document.getElementById('cell_' + next_action[2]);
		curr_y = (typeof(next_y)==='undefined') ? curr_cell.offsetTop + 0 : next_y;
		curr_x = (typeof(next_x)==='undefined') ? curr_cell.offsetLeft + 0 : next_x;
		next_y = next_cell.offsetTop + 0;
		next_x = next_cell.offsetLeft + 0;
		const timeout_id = setTimeout(function(_curr_y, _curr_x, _next_y, _next_x) {
			if(action[1] == 'l') {
				curr_cell.dispatchEvent(new CustomEvent('mousedown', { 'bubbles': true , 'detail': { 'button0': true } }));
				curr_cell.dispatchEvent(new CustomEvent('mouseup', { 'bubbles': true , 'detail': { 'button0': true } }));
			} else if(action[1] == 'm') {
				curr_cell.dispatchEvent(new CustomEvent('mousedown', { 'bubbles': true , 'detail': { 'button0': true, 'button2': true } }));
				curr_cell.dispatchEvent(new CustomEvent('mouseup', { 'bubbles': true , 'detail': { 'button0': true, 'button2': true } }));
			} else if(['f','q','c'].includes(action[1])) {
				curr_cell.dispatchEvent(new CustomEvent('mousedown', { 'bubbles': true , 'detail': { 'button2': true } }));
				curr_cell.dispatchEvent(new CustomEvent('mouseup', { 'bubbles': true , 'detail': { 'button2': true } }));
			}
			winmine.replay_action_idx = winmine.replay_action_idx + 1;
			if(i < action_count) {
				winmine.animate_cursor(cursor, action[0], next_action[0], _curr_y, _curr_x, _next_y, _next_x);
			}
		}, action_delay, curr_y, curr_x, next_y, next_x);
		winmine.replay_setTimeout.push(timeout_id);
	}
};

winmine.go_to_replay_mode = function(autoplay) {
	/* support partial-board loss playbacks by setting the action_replay variable from winmine.game_clicks when we're not already in replay mode */
	const complete_action_replay = (typeof(winmine.pre_action_replay) !== 'undefined' && winmine.pre_action_replay.length !== 0) ? winmine.pre_action_replay.concat(winmine.action_replay) : winmine.action_replay;
	const action_replay = (winmine.replay_mode) ? complete_action_replay : winmine.game_clicks;
	window.location = window.location.href.split(/[?#]/)[0] + '?height=' + winmine.height + '&width=' + winmine.width + '&mines=' + winmine.mine_count + '&board_mines=' + JSON.stringify(winmine.mines) + '&board_backup_mine=' + winmine.backup_y + '_' + winmine.backup_x + '&time=' + winmine.game_duration + '&action_replay=' +  JSON.stringify(action_replay) + '&autoplay=' + autoplay.toString();
};

winmine.update_game_over_menu = function() {
	document.getElementsByClassName('is-prev-game-menu-frame')[0].classList.remove('is-prev-game-menu-frame-enabled');
	document.getElementsByClassName('replay-menu-frame')[0].classList.add('replay-menu-frame-enabled');
	const is_small_board = (window.innerWidth < 164) ? true : false;
	if(is_small_board) {
		document.getElementsByClassName('menu-opener-frame')[0].classList.add('menu-opener-frame-enabled');
		document.getElementsByClassName('replay-menu-frame')[0].classList.remove('replay-menu-frame-enabled');
	}
};

winmine.select_menu_item = function(event) {

	if(event.target.classList.contains('menu-item-disabled')) {
		return;
	}

	/* in case menu content is already open, remove them through their -enabled class name */
	for (let value of document.getElementsByClassName('feature-content')) {
		const div_children = value.children;
		for (let item of div_children) {
			item.classList.forEach(function(c) {
				if(c.includes('-enabled')) {
					item.classList.remove(c);
				}
			});
		}
	}
	document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');

	const item_text = event.target.getAttribute('data-name');
	if(item_text === 'New') {
		window.location = window.location.href.split(/[?#]/)[0] + '?height=' + winmine.height + '&width=' + winmine.width + '&mines=' + winmine.mine_count;
	} else if(item_text === 'Beginner') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height='+winmine.setting.beginner[0]+'&width='+winmine.setting.beginner[1]+'&mines='+winmine.setting.beginner[2], 'Beginner' + '_' + new_window_salt, 'width='+((winmine.setting.beginner[1] *winmine.setting.x_px)+20)+',height='+((winmine.setting.beginner[0] *winmine.setting.y_px)+83)+',top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
	} else if(item_text === 'Intermediate') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height=16&width=16&mines=40', 'Intermediate' + '_' + new_window_salt, 'width='+((16*winmine.setting.y_px)+20)+',height='+((16*winmine.setting.y_px)+83)+',top=' + (window.screenY+50) + ',left=' + (window.screenX+50));

	} else if(item_text === 'Expert') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height=16&width=30&mines=99', 'Expert' + '_' + new_window_salt, 'width='+((30*winmine.setting.y_px)+20)+',height='+((16*winmine.setting.y_px)+83)+',top=' + (window.screenY+50) + ',left=' + (window.screenX+50));

	} else if(item_text === 'Custom...') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-custom-game')[0].classList.add('content-custom-game-enabled');
		document.getElementsByClassName('custom-game-field')[0].value = winmine.setting.custom_field[0];
		document.getElementsByClassName('custom-game-field')[1].value = winmine.setting.custom_field[1];
		document.getElementsByClassName('custom-game-field')[2].value = winmine.setting.custom_field[2];

	} else if(item_text === 'Marks (?)') {
		if(event.target.classList.contains('menu-mark')) {
			event.target.classList.remove('menu-mark');
			winmine.localStorage.setItem('setting_marks', 'false');
			winmine.setting.marks = false;
			winmine.marked_cells.forEach(function(item) {
				document.getElementById('cell_'+item).classList.remove('question');
			});
			winmine.marked_cells = [];
		} else {
			event.target.classList.add('menu-mark');
			winmine.localStorage.setItem('setting_marks', 'true');
			winmine.setting.marks = true;
		}

	} else if(item_text === 'Color') {
		if(event.target.classList.contains('menu-mark')) {
			event.target.classList.remove('menu-mark');
			document.documentElement.style.setProperty('filter', 'grayscale(100%)');
			winmine.localStorage.setItem('setting_color', 'false');
			winmine.color = false;
		} else {
			event.target.classList.add('menu-mark');
			document.documentElement.style.removeProperty('filter');
			winmine.localStorage.setItem('setting_color', 'true');
			winmine.color = true;
		}

	} else if(item_text === 'Best Times...') {
		const classic_best_times_row_html = function(saved_key_names, difficulty) {
			let difficulty_config = '';
			if(difficulty === 'beginner') {	difficulty_config = winmine.setting.beginner2;	}
			if(difficulty === 'intermediate') {	difficulty_config = '16x16/40';	}
			if(difficulty === 'expert') {	difficulty_config = '16x30/99';	}
			let best_times_cleared_on = winmine.localStorage.getItem('setting_best_times_cleared_on');
			best_times_cleared_on = (best_times_cleared_on === null) ? Date.parse('1990-01-01') : Date.parse(best_times_cleared_on);
			let result = saved_key_names.filter(function(item) { item = item.split('|'); return item[winmine.i('result')] == 'w' & item[winmine.i('board')] == difficulty_config; })
				.filter(function(item) { return Date.parse(item.split('|')[winmine.i('timestamp')]) > best_times_cleared_on; });
			const best_time_idx = Math.min.apply(null, result.map(function(x){return x.split('|')[winmine.i('duration')]; })).toFixed(3);
			result = result[result.findIndex(x => x.split('|')[winmine.i('duration')] === best_time_idx)];
			const empty_result = Object.keys(winmine.localStorage_key_items);
			empty_result[winmine.i('duration')] = 999;
			empty_result[winmine.i('name')] = 'Anonymous';
			result = (typeof(result)=='undefined') ? empty_result : result.split('|');
			const record_difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)+':';
			const record_score = (window.innerWidth > 175) ? Math.round(result[winmine.i('duration')]) + ' seconds' : Math.round(result[winmine.i('duration')]);
			const record_name = (window.innerWidth < 175 && result[winmine.i('name')].length > 6) ? result[winmine.i('name')].substring(0,5) + '..' : result[winmine.i('name')];
			return('<div>' + record_difficulty + '</div><div title=\"'+result[winmine.i('duration')]+' seconds\">' + record_score + '</div><div title=\"'+result[winmine.i('name')]+'\">' + record_name + '</div>');
		};
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-best-times')[0].classList.add('content-best-times-enabled');
		const keys_to_search = winmine.localStorage.keys();
		const table = document.getElementsByClassName('content-best-times-table')[0];
		table.innerHTML = classic_best_times_row_html(keys_to_search, 'beginner') + classic_best_times_row_html(keys_to_search, 'intermediate') + classic_best_times_row_html(keys_to_search, 'expert');

	} else if(item_text === 'Exit') {
		window.close();

	} else if(item_text === 'Contents') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-help-contents')[0].classList.add('content-help-contents-enabled');

	} else if(item_text === 'About Minesweeper...') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-about')[0].classList.add('content-about-enabled');

	} else if(item_text === 'Extra Menu*') {
		const extra_menu = document.getElementsByClassName('extra-menu-frame')[0];
		const extra_replay_menu = document.getElementsByClassName('extra-replay-menu-frame')[0];
		if(event.target.classList.contains('menu-mark')) {
			extra_menu.classList.remove('display-inline-block');
			extra_replay_menu.classList.remove('display-inline-block');
			event.target.classList.remove('menu-mark');
			winmine.localStorage.setItem('setting_extra_menu', 'false');
		} else {
			extra_menu.classList.add('display-inline-block');
			extra_replay_menu.classList.add('display-inline-block');
			event.target.classList.add('menu-mark');
			winmine.localStorage.setItem('setting_extra_menu', 'true');
		}

	} else if(item_text === 'Game History') {
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-game-history')[0].classList.add('content-game-history-enabled');
		document.getElementsByClassName('content-game-history-delete')[0].classList.remove('content-game-history-delete-enabled');
		document.getElementsByClassName('content-game-history-no-history')[0].classList.remove('content-game-history-no-history-enabled');
		const winning_keys = winmine.localStorage.keys().filter(x => ['w|','l|'].includes(x.substring(0,2)));
		/* stop here if history object still matches localStorage */
		winmine.history_needs_refreshing = (typeof(winmine.history_needs_refreshing)!='undefined') ? winmine.history_needs_refreshing : false;
		if(winning_keys.length === winmine.hist.length & !winmine.history_needs_refreshing) {
			if(winning_keys.length === 0) {
				document.getElementsByClassName('content-game-history-no-history')[0].classList.add('content-game-history-no-history-enabled');
			}
			return;
		} else {
			winmine.hist = [];
			winmine.history_needs_refreshing = false;
		}
		const hist_datetimes = [];
		winning_keys.forEach(function(item, index) {
			winmine.hist.push(index);
			const new_item = item.split('|');
			winmine.hist[index] = new_item;
			hist_datetimes.push(new_item[8]);
		});
		const unique_boards = [];
		winmine.hist.filter(x => x[0]==='w').forEach(function(item) { if(!unique_boards.includes(item[1])) { unique_boards.push(item[1]); }});
		const select_element = document.getElementsByClassName('content-game-history-select')[0];
		select_element[0].value = winmine.setting.beginner2;
		select_element[0].innerText = winmine.setting.beginner2 + '\xa0\xa0\xa0\xa0Beg';
		Array.from(select_element.children).forEach(function(item) {
			if(item.classList.contains('select-option-is-new')) {
				item.remove();
			}
		});
		if(unique_boards.length > 0) {
			select_element.options.add(new Option('─────────────', ''));
			select_element.options[select_element.options.length-1].disabled = true;
			select_element.options[select_element.options.length-1].classList.add('select-option-is-new');
			unique_boards.forEach(function(item) {
				if(item === undefined) { return; }
				if(![winmine.setting.beginner2,'16x16/40','16x30/99'].includes(item)) {
					select_element.options.add(new Option(item, item));
					select_element.options[select_element.options.length-1].classList.add('select-option-is-new');
				}
			});
		}
		const sorted = hist_datetimes.slice().sort(function(a, b) {
			return new Date(a) - new Date(b);
		});
		const recent_games_datetimes = sorted.slice(-8);
		const recent_games = winmine.hist.filter(i => recent_games_datetimes.includes(i[8]));
		const recent_games_boards = []; recent_games.forEach(function(item) { recent_games_boards.push(item[1]); });
		const recent_board = winmine.get_most_common_item_in_array(recent_games_boards);
		select_element.value = (unique_boards.length == 0) ? 'losses' : recent_board;
		select_element.dispatchEvent(new Event('change'));

	} else if(item_text === 'Settings') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-settings')[0].classList.add('content-settings-enabled');
		const show_saving_notification = function() {
			const alert_div = document.createElement('div');
			alert_div.innerText = 'Saving...';
			alert_div.classList.add('content-settings-save-notification');
			const alert_div_wrap = document.createElement('div');
			alert_div_wrap.prepend(alert_div);
			document.getElementsByClassName('content-settings')[0].prepend(alert_div_wrap);
			setTimeout(function() { alert_div.classList.add('content-settings-save-notification-transitioned'); }, 1); /* first setTimeout gives DOM time to render above class with 100% opacity, any wait duration will do */
			setTimeout(function() {	alert_div_wrap.parentNode.removeChild(alert_div_wrap); }, 2000);	/* second setTimeout gives DOM time to render above class with 0% opacity and ease-out of 2 second */
		};
		/* user setting: beginner board size */
		document.getElementById(winmine.setting.beginner[0] + 'x' + winmine.setting.beginner[1] + '/' + winmine.setting.beginner[2]).checked = true;
		const on_change_setting_beginner_board_size = function(new_val) {
			show_saving_notification();
			const save_value = (['8,8,10','9,9,10'].includes(new_val)) ? new_val : winmine.setting.beginner.join(',');
			winmine.localStorage.setItem('setting_beginner_board', save_value);
			winmine.setting.beginner = save_value.split(',');
			winmine.setting.beginner2 = winmine.setting.beginner[0] + 'x' + winmine.setting.beginner[1] + '/' + winmine.setting.beginner[2];
			winmine.history_needs_refreshing = true;
		};
		document.getElementById('8x8/10').addEventListener('change', function(e) { on_change_setting_beginner_board_size(e.target.value);	});
		document.getElementById('9x9/10').addEventListener('change', function(e) { on_change_setting_beginner_board_size(e.target.value);	});
		/* user setting: board cell height pixel size */
		const setting_cell_y_elem =	document.getElementsByClassName('content-settings-cell-size-input')[0];
		setting_cell_y_elem.value = winmine.setting.y_px;
		const on_change_setting_cell_y = function(new_val) {
			show_saving_notification();
			const save_value = ([...Array(128).keys()].slice(4).map(String).includes(new_val)) ? new_val : '16';
			winmine.localStorage.setItem('setting_cell_size_height', save_value);
			winmine.setting.y_px = save_value;
		};
		setting_cell_y_elem.addEventListener('change', function(e) { on_change_setting_cell_y(e.target.value) });
		setting_cell_y_elem.addEventListener('keyup' , function(e) { on_change_setting_cell_y(e.target.value) });
		/* user setting: board cell width pixel size */
		const setting_cell_x_elem =	document.getElementsByClassName('content-settings-cell-size-input')[1];
		setting_cell_x_elem.value = winmine.setting.x_px;
		const on_change_setting_cell_x = function(new_val) {
			show_saving_notification();
			const save_value = ([...Array(128).keys()].slice(4).map(String).includes(new_val)) ? new_val : '16';
			winmine.localStorage.setItem('setting_cell_size_width', save_value);
			winmine.setting.x_px = save_value;
		};
		setting_cell_x_elem.addEventListener('change', function(e) { on_change_setting_cell_x(e.target.value) });
		setting_cell_x_elem.addEventListener('keyup' , function(e) { on_change_setting_cell_x(e.target.value) });
		/* user setting: player name */
		const setting_name_elem = document.getElementsByClassName('content-settings-default-name-input')[0];
		setting_name_elem.value = winmine.setting.player_name;
		const on_change_setting_player_name = function(new_val) {
			show_saving_notification();
			let save_value = new_val.trim().substring(0,36);
			save_value = (save_value == '') ? 'Anonymous' : save_value;
			winmine.localStorage.setItem('setting_player_name', save_value);
			winmine.setting.player_name = save_value;
		};
		setting_name_elem.addEventListener('change', function(e) { on_change_setting_player_name(e.target.value) });
		setting_name_elem.addEventListener('keyup' , function(e) { on_change_setting_player_name(e.target.value) });
		/* user setting: api url */
		const setting_url_elem = document.getElementsByClassName('content-settings-api-url')[0];
		setting_url_elem.value = winmine.setting.api_url;
		const on_change_setting_api_url = function(new_val) {
			show_saving_notification();
			let save_value = new_val.trim().substring(0,36);
			winmine.localStorage.setItem('setting_api_url', save_value);
			winmine.setting.api_url = save_value;
		};
		setting_url_elem.addEventListener('change', function(e) { on_change_setting_api_url(e.target.value) });
		setting_url_elem.addEventListener('keyup' , function(e) { on_change_setting_api_url(e.target.value) });
	}
};

/* Create all the javascript event listeners once <html> DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function() {
	winmine.load_user_settings();
	winmine.load_board_settings();
	winmine.create_mine_field();
	winmine.set_3bv();
	winmine.insert_seven_segment_elements();
	winmine.init_counter(winmine.mine_count);
	winmine.init_timer();
	winmine.set_file_menu_item_marks();

	winmine.cleared = 0; /* clear_mine_field() increments this to determine game win */
	winmine.flagged_cells = []; /* cells are pushed here on right click */
	winmine.marked_cells = []; /* another right click, for question mark cells */
	winmine.game_clicks = []; /* record actions for game save/replay */
	winmine.game_over = false; /* set to true on win/loss */
	winmine.hist = []; /* when Game History is opened, gets filled for history table and stats */
	winmine.game_started = false; /* for knowing a cell has been clicked (so we know the timer has been started) */
	winmine.most_recent_id = ''; /* stop left+right multi clicks from double-triggering cell event */

	/* file menu container events are delegated from the menu item container */
	document.getElementsByClassName('file-menu')[0].addEventListener('mouseup', function(event) {
		if(event.target.classList.contains('menu-item')) {
			winmine.select_menu_item(event);
		}
	});

	/* gameplay cell events are delegated by the .cell-container */
	const cell_container = document.getElementsByClassName('cell-container')[0];
	cell_container.addEventListener('mouseover', function(event) {
		if(winmine.game_over) { return; }
		if(winmine.mouse_is_down && winmine.mouse2_is_down) {
			const coords = winmine.id_as_y_x(event.target.id);
			const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
			document.querySelectorAll('#cell_' + neighboring_cells.join(':not(.flag):not(.clear),#cell_') + ':not(.flag):not(.clear)').forEach(function (element) {
				element.classList.add('active');
			});
			if(!event.target.classList.contains('flag')) {
				event.target.classList.add('active');
			}
		}
		if(event.target.classList.contains('flag')) { return; }
		if(event.target.classList.contains('question')) { return; }
		if(winmine.mouse_is_down && !winmine.multi_cell) {
			event.target.classList.add('active');
		}
	});
	cell_container.addEventListener('mouseout', function(event) {
		if(winmine.game_over) { return; }
		if(winmine.mouse_is_down && winmine.mouse2_is_down) {
			const coords = winmine.id_as_y_x(event.target.id);
			const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
			document.querySelectorAll('#cell_' + neighboring_cells.join(',#cell_')).forEach(function (element) {
				element.classList.remove('active');
			});
		}
		if(event.target.classList.contains('flag')) { return; }
		if(event.target.classList.contains('question')) { return; }
		event.target.classList.remove('active');
	});
	cell_container.addEventListener('mousedown', function(event) {
		if(winmine.game_over) { return; }
		if(event.button === 0 || event.detail.button0) { winmine.mouse_is_down = true; }
		if(event.button === 2 || event.detail.button2) { winmine.mouse2_is_down = true; }
		if(winmine.mouse_is_down && winmine.mouse2_is_down) {
			const coords = winmine.id_as_y_x(event.target.id);
			const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
			document.querySelectorAll('#cell_' + neighboring_cells.join(':not(.flag):not(.clear),#cell_') + ':not(.flag):not(.clear)').forEach(function (element) {
				element.classList.add('active');
			});
			if(!event.target.classList.contains('flag')) {
				event.target.classList.add('active');
			}
			winmine.multi_cell = true;
		}
		if(winmine.mouse2_is_down) {
			if(winmine.mouse_is_down) { return;	}
			if(event.target.classList.contains('clear')) { return; }
			winmine.flag_cell(event.target.id);
			return;
		}
		if(event.target.classList.contains('flag')) { return; }
		if(event.target.classList.contains('question')) { return; }
		if(!event.target.classList.contains('clear')) {
			event.target.classList.add('active');
		}
	});
	cell_container.addEventListener('mouseup', function(event) {
		if(winmine.game_over) { return; }
		if(!winmine.mouse_is_down & !winmine.mouse2_is_down) { return; }
		/* mouseup is managing the two ways two clear cell(s), direct left click or indirect left+right click */
		if(event.button === 0 || event.detail.button0) { winmine.mouse_is_down = false; }
		if(event.button === 2 || event.detail.button2) { winmine.mouse2_is_down = false; }
		const elem_id = event.target.id;
		if(winmine.multi_cell) {
			if(event.target.classList.length >= 2) {
				const coords = winmine.id_as_y_x(elem_id);
				const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
				const flagged_neighboring_cells = [];
				document.querySelectorAll('#cell_' + neighboring_cells.join(',#cell_')).forEach(function (element) {
					if(element.classList.contains('flag')) {
						flagged_neighboring_cells.push(element.id.substring(5));
					}
					element.classList.remove('active');
				});
				
				if(flagged_neighboring_cells.length == event.target.classList[1].substring(1) && elem_id !== winmine.most_recent_id) {
					winmine.most_recent_id = elem_id;
					const cells_to_choose = neighboring_cells.filter(x => !flagged_neighboring_cells.includes(x));
					let already_cleared = 0;
					cells_to_choose.forEach(function (element) {
						const e = document.getElementById('cell_'+element);
						if(e.classList.contains('clear')) {
							already_cleared = already_cleared + 1;
							return;
						}
						winmine.choose_cell('cell_'+element);
						e.classList.remove('question'); /* marked cells are triggered like normal cells. remove class to prevent confusion */
					});
					/* only record game clicks that trigger a cell (effective clicks) */
					if(neighboring_cells.length > already_cleared) {
						winmine.game_clicks.push([winmine.get_game_duration(1), 'm', elem_id.substring(5)]);
					}
				}
			} else {
				const coords = winmine.id_as_y_x(elem_id);
				const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
				document.querySelectorAll('#cell_' + neighboring_cells.join(',#cell_')).forEach(function (element) {
					element.classList.remove('active');
				});
			}
			event.target.classList.remove('active');
			if(!winmine.mouse_is_down && !winmine.mouse2_is_down) {
				winmine.multi_cell = false;
			}
			return;
		}
		if(event.button === 2 || event.detail.button2) { return; }
		if(event.target.classList.contains('flag')) { return; }
		if(event.target.classList.contains('question')) { return; }
		if(event.target.classList.contains('clear')) { return; }
		event.target.classList.remove('active');
		if(winmine.game_started) {
			winmine.game_clicks.push([winmine.get_game_duration(1), 'l', elem_id.substring(5)]);
		} else {
			winmine.game_clicks.push(['0.0', 'l', elem_id.substring(5)]);
		}
		winmine.choose_cell(elem_id);
	});

	 /* game smiley event behavior */
	const smiley_frame = document.getElementsByClassName('smiley-container')[0];
	smiley_frame.addEventListener('mousedown', function(e) {
		smiley_frame.classList.add('smiley-container-mousedown');
		smiley_frame.classList.add('face-neutral');
		winmine.mouse_is_down_smiley = true;
	});
	smiley_frame.addEventListener('mouseup', function(e) {
		if(winmine.mouse_is_down_smiley) {
			window.location = '?height=' + winmine.height + '&width=' + winmine.width + '&mines=' + winmine.mine_count;
		}
	});
	smiley_frame.addEventListener('mouseover', function(e) {
		if(winmine.mouse_is_down_smiley) {
			smiley_frame.classList.add('smiley-container-mousedown');
			smiley_frame.classList.add('face-neutral');
		}
	});
	smiley_frame.addEventListener('mouseout', function(e) {
		smiley_frame.classList.remove('smiley-container-mousedown');
		smiley_frame.classList.remove('face-neutral');
		if(smiley_frame.classList.contains('face-cursor-down')) {
			return;
		}
		if(winmine.game_over) {
			if(winmine.game_win) {
				smiley_frame.classList.add('face-game-win');
			} else {
				smiley_frame.classList.add('face-game-over');
			}
		} else {
			smiley_frame.classList.add('face-neutral');
		}
	});

	/* body events */
	/* simpler to just prevent default right click contextmenu on entire page */
	document.body.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	});
	document.body.addEventListener('mousedown', function(event) {
		if(!['INPUT','SELECT'].includes(event.target.nodeName)) {
			event.preventDefault(); /* prevent browser from displaying the 'not allowable' cursor and trying to html draggable-item things */
		}
		if(event.button === 2 && !winmine.multi_cell) { return; }
		if(winmine.replay_mode) { return; }
		if(winmine.game_over === false && !event.target.classList.contains('smiley-container')) {
			smiley_frame.classList.remove('face-neutral');
			smiley_frame.classList.add('face-cursor-down');
		}
	});
	/* winmine.exe would remember your mouse button was down even if you left the window, as long as it stayed in focus. not sure this is possible in browser */
	document.body.addEventListener('mouseleave', function(event) {
		if(event.button === 2) { return; }
		if(winmine.game_over) { return; }
		winmine.mouse_is_down = false;
		smiley_frame.classList.remove('face-cursor-down');
		smiley_frame.classList.add('face-neutral');
	});
	document.body.addEventListener('mouseup', function(event) {
		if(event.button === 2 && !winmine.multi_cell) { return; }
		if(event.button === 0) {
			winmine.mouse_is_down = false;
			winmine.mouse_is_down_smiley = false;
		}
		if(winmine.game_over === false) {
			smiley_frame.classList.remove('face-cursor-down');
			smiley_frame.classList.add('face-neutral');
		}
	});

	/* Menu feature events */
	document.getElementsByClassName('file-menu-frame')[0].addEventListener('mouseover', function() {
		/* keep menu blocks on top of everything and above newly opened content popups */
		const file_menu = document.querySelectorAll('.menu-game-container, .menu-help-container, .menu-extra-container');
		for(const item of file_menu) {
			item.classList.add('menu-container-top');
		}
	});

	document.querySelector('.content-custom-game-buttons > button:nth-child(1)').addEventListener('mouseup', function() {
		let height = parseInt(document.getElementsByClassName('custom-game-field')[0].value, 10);
		let width = parseInt(document.getElementsByClassName('custom-game-field')[1].value, 10);
		let mines = parseInt(document.getElementsByClassName('custom-game-field')[2].value, 10);
		if(height < 4)  { height = 4; }
		if(width  < 4)  { width = 4; }
		if(height > 999) { height = 999; }
		if(width  > 999) { width = 999; }
		if(mines < 1)  { mines = 1 }
		if(mines > ((height*width)-1)) { mines = (height*width)-1; }
		winmine.localStorage.setItem('setting_custom_field', JSON.stringify([height, width, mines]));
		const new_window_salt = winmine.random(100000,999999);
		const window_width = (width*winmine.setting.x_px)+20;
		const window_height = (height*winmine.setting.y_px)+83;
		window.open('?height=' + height + '&width=' + width + '&mines=' + mines, 'Custom' + '_' + new_window_salt, 'width=' + window_width + ',height=' + window_height + ',top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
		document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');
		document.getElementsByClassName('content-custom-game')[0].classList.remove('content-custom-game-enabled');
	});

	document.querySelector('.content-custom-game-buttons > button:nth-child(2)').addEventListener('mouseup', function() {
		document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');
		document.getElementsByClassName('content-custom-game')[0].classList.remove('content-custom-game-enabled');
	});

	document.querySelector('.content-best-times-buttons > div > button:nth-child(2)').addEventListener('mouseup', function() {
		document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');
		document.getElementsByClassName('content-best-times')[0].classList.remove('content-best-times-enabled');
	});

	document.querySelector('.content-best-times-buttons > div > button:nth-child(1)').addEventListener('mouseup', function() {
		document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');
		document.getElementsByClassName('content-best-times')[0].classList.remove('content-best-times-enabled');
		winmine.localStorage.setItem('setting_best_times_cleared_on', new Date(Date.now()).toISOString());
		document.querySelector('[data-name=\'Best Times...\']').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	});

	document.querySelector('.content-best-time-game-buttons > button').addEventListener('mouseup', function() {
		const username = document.querySelector('.content-best-time-game-input > input').value;
		winmine.save_record_name(username);
		document.getElementsByClassName('feature-content-frame')[0].classList.remove('feature-content-enabled');
		document.getElementsByClassName('content-best-time-game')[0].classList.remove('content-best-time-game-enabled');
	});

	document.querySelector('.content-best-time-game-input > input').addEventListener('keyup', event => {
		if (event.key == 'Enter') {
			best_time_game_ok_button.dispatchEvent(new Event('mouseup'));
		}
	});

	document.getElementsByClassName('content-game-history-table')[0].addEventListener('contextmenu', function(event) {
		const selected_row = event.target.parentNode;
		if(selected_row.cells[3].hasAttribute('data-sort-value')) {
			selected_row.classList.add('content-game-history-context-row-enabled');
			winmine.game_history_table_context_row = selected_row; /* stash so we can remove row style class when contextmenu is removed */
			const context = document.getElementsByClassName('content-game-history-context')[0];
			const primary_key_timestamp = selected_row.cells[3].getAttribute('data-sort-value');
			const key = winmine.hist.filter(function(x) { return primary_key_timestamp == x[winmine.i('timestamp')]; })[0];
			const key_name = key.join('|');
			const item_value = JSON.parse(winmine.localStorage.getItem(key_name));
			const height = key[winmine.i('board')].split('x')[0];
			const width = key[winmine.i('board')].split('x')[1].split('/')[0];
			const mine_count = key[1].split('x')[1].split('/')[1];
			const play_again_url = '?height=' + height + '&width=' + width + '&mines=' + mine_count + '&board_mines=' + JSON.stringify(item_value[winmine.i('mines', 'v')]) + '&board_backup_mine=' + item_value[winmine.i('backup_mine', 'v')];
			const watch_replay_url = play_again_url + '&time=' + key[winmine.i('duration')] + '&action_replay=' + JSON.stringify(item_value[winmine.i('action_replay', 'v')]);
			context.children[0].setAttribute('data-action-url', play_again_url);
			context.children[1].setAttribute('data-action-url', watch_replay_url);
			context.classList.add('content-game-history-context-enabled');
			const feature_content_frame = document.getElementsByClassName('feature-content-frame')[0];
			const scroll_y_offset = feature_content_frame.scrollTop - 14;
			const click_near_bottom_offset = ((feature_content_frame.clientHeight - event.clientY) < 50) ? -50 : 0;
			const click_near_right_offset = ((feature_content_frame.clientWidth - event.clientX) < 80) ? -80 : 0;
			context.style.left = (event.clientX + click_near_right_offset) + 'px';
			context.style.top = (event.clientY + scroll_y_offset + click_near_bottom_offset) + 'px';
		}
	});
	document.getElementsByClassName('content-game-history-table')[0].addEventListener('mouseup', function(event) {
		if(typeof winmine.game_history_table_context_row !== 'undefined') {
			document.getElementsByClassName('content-game-history-context')[0].classList.remove('content-game-history-context-enabled');
			winmine.game_history_table_context_row.classList.remove('content-game-history-context-row-enabled');
			delete winmine.game_history_table_context_row;
		}
	});

	const table_column_style_toggle = function(add_or_remove, row_idx, col_idx) {
		const row_range = 24; /* set a range to avoid toggling every cell in a column in case of hundreds+ records */
		const row_count = game_history_tbody.rows.length;
		const search_min = ((row_idx - row_range) < 0) ? 0 : row_idx - row_range;
		const search_max = ((row_idx + row_range) > row_count) ? row_count : row_idx + row_range;
		for (let i = search_min; i < search_max; i++) {
			game_history_tbody.rows[i].cells[col_idx].classList[add_or_remove]('col-hover');
		}
	};
	const game_history_tbody = document.querySelector('.content-game-history-table > table > tbody');
	game_history_tbody.addEventListener('mouseover', function(event) {
		if(event.target.nodeName === 'TD') {
			table_column_style_toggle("add", event.target.parentNode.rowIndex, event.target.cellIndex)
		}
	});
	game_history_tbody.addEventListener('mouseout', function(event) {
		if(event.target.nodeName === 'TD') {
			table_column_style_toggle("remove", event.target.parentNode.rowIndex, event.target.cellIndex)
		}
	});

	document.querySelector('.content-game-history-table > table > thead').addEventListener('mouseup', function(event) {
		if(event.target.getAttribute('scope') === 'col') {
			const cell_idx_derived = (event.target.rowSpan == 1) ? (event.target.cellIndex + 4) : event.target.cellIndex;
			winmine.sort_table(document.querySelector('.content-game-history-table > table > tbody'), cell_idx_derived);
			const previous_sorted = document.querySelector('.content-game-history-table > table > thead th.sort-asc-icon, .content-game-history-table > table > thead th.sort-desc-icon');
			if(previous_sorted != null) {
				previous_sorted.classList.remove('sort-asc-icon');
				previous_sorted.classList.remove('sort-desc-icon');
			}
			if(winmine.sort_table_asc) {
				event.target.classList.add('sort-desc-icon');
			} else {
				event.target.classList.add('sort-asc-icon');
			}
		}
	});

	document.getElementsByClassName('content-game-history-select')[0].addEventListener('change', function(event) {
		const history_table_tbody = document.querySelector('.content-game-history-table > table > tbody');
		winmine.fill_game_history_table(history_table_tbody, event.target.value);
		winmine.sort_table_asc = false;
		const table_th_column_date = document.querySelector('.content-game-history-table > table > thead th:nth-child(4)');
		table_th_column_date.dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	});

	document.getElementsByClassName("game-history-import-input")[0].addEventListener("change", function() {
		if (this.files.length === 0) {
			return;
		}
		const reader = new FileReader();
		reader.onload = function fileReadCompleted() {
			winmine.import_game_history(reader.result);
		};
		reader.readAsText(this.files[0]);
	});
	document.getElementsByClassName('content-game-history-icons-wrap')[0].addEventListener('mouseup', function(event) {
		const item_text = event.target.getAttribute('data-game-history-action');
		if(item_text === 'game-history-save') {
			winmine.save_game_history();
		} else if(item_text === 'game-history-import') {
			const file_elem = document.getElementsByClassName('game-history-import-input')[0];
				if(file_elem) {
					file_elem.click();
				}
		} else if(item_text === 'game-history-delete') {
			document.getElementsByClassName('content-game-history-delete')[0].classList.add('content-game-history-delete-enabled');
			const select_option_board_value = document.getElementsByClassName('content-game-history-select')[0].selectedOptions[0].value;
			document.querySelector('.content-game-history-delete div[data-game-delete-action="game-delete-board"] span span').textContent = select_option_board_value;
		}
	});

	document.getElementsByClassName('content-game-history-delete')[0].addEventListener('mouseup', function(event) {
		const item_text = event.target.parentNode.getAttribute('data-game-delete-action') || event.target.parentNode.parentNode.getAttribute('data-game-delete-action');
		if(item_text === 'game-delete-cancel') {
			document.getElementsByClassName('content-game-history-delete')[0].classList.remove('content-game-history-delete-enabled');
		} else if(item_text === "game-delete-board") {
			const target_board = document.querySelector('.content-game-history-delete div[data-game-delete-action="game-delete-board"] span span').textContent;
			const keys_to_delete = winmine.localStorage.keys().filter(function(x) { return x.split('|')[1] === target_board });
			for(const key_name of keys_to_delete) {
				winmine.localStorage.removeItem(key_name);
			}
 			document.querySelector('.content-game-history .content-escape-button').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
			document.querySelector('[data-name="Game History"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
		} else if(item_text === 'game-delete-every-board') {
			const keys_to_delete = winmine.localStorage.keys().filter(function(x) { return ['w|','l|'].includes(x.substring(0,2)); });
			for(const key_name of keys_to_delete) {
				winmine.localStorage.removeItem(key_name);
			}
			winmine.hist = [];
			document.querySelector('.content-game-history .content-escape-button').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
			document.querySelector('[data-name="Game History"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
			document.getElementsByClassName('content-game-history-select')[0].selectedIndex = 0;
			document.querySelectorAll('.content-game-history-select option').forEach(function(e, i) { if(i > 7) { e.parentNode.removeChild(e) } });
		}
	});

	document.getElementsByClassName('content-help-contents-toc')[0].addEventListener('mouseup', function(event) {
		const item_text = event.target.getAttribute('data-class-toggle');
		if(item_text === null) {
			return;
		}
		const toggle_item = document.getElementsByClassName(item_text)[0];
		document.querySelectorAll('.content-help-contents-toc > div').forEach(function(item){
			item.classList.remove('text-decoration-underline');
			item.classList.add('text-decoration-none');
		});
		event.target.classList.remove('text-decoration-none');
		event.target.classList.add('text-decoration-underline');
		document.querySelectorAll('.content-help-contents-body > div').forEach(function(item){
			item.classList.remove('display-block');
			item.classList.add('display-none');
		});
		toggle_item.classList.remove('display-none');
		toggle_item.classList.add('display-block');
	});

	document.querySelector('.replay-menu-item[data-replay-menu="play-pause-button"]').addEventListener('dblclick', function (event) {
		winmine.go_to_replay_mode(true);
	});
	document.getElementsByClassName('replay-menu-container')[0].addEventListener('mouseup', function(event) {
		const action_name = event.target.getAttribute('data-replay-menu') || event.target.parentNode.getAttribute('data-replay-menu');
		if(action_name === 'play-pause-button') {
			if(!winmine.replay_mode) {
				winmine.go_to_replay_mode(true);
				return;
			}
			if(winmine.game_over) {
				return;
			}
			const play_pause = document.querySelector('.replay-menu-item[data-replay-menu="play-pause-button"]');
			if(winmine.replay_pause) {
				winmine.replay_game();
				play_pause.childNodes[0].classList.remove('color-red');
				play_pause.childNodes[1].classList.add('color-red');
				play_pause.title = 'Pause (double-click to restart)';
				/* start timer up again */
				if(typeof(winmine.replay_pause_time) !== 'undefined') {
					winmine.start_timer_worker(winmine.replay_pause_time);
				}
			} else {
				if(typeof(winmine.replay_setTimeout) !== 'undefined') {
					winmine.replay_setTimeout.forEach(function(item) { clearTimeout(item); });
				}
				play_pause.childNodes[0].classList.add('color-red');
				play_pause.childNodes[1].classList.remove('color-red');
				play_pause.title = 'Play (double-click to restart)';
				/* stop timer */
				if(typeof(winmine.timer_worker) !== 'undefined') {
					/* add 1 because the action replay is saved from 0 seconds but winmine classic timer starts at 1 unless configured. .toFixed(3) because that's what  */
					winmine.replay_pause_time = parseFloat((winmine.action_replay[winmine.replay_action_idx][0]) + 1).toFixed(3);
					winmine.timer_worker.terminate();
				}
			}
			winmine.replay_pause = (winmine.replay_pause) ? false : true;
		}

		else if(action_name === 'play-again-button') {
			const play_again_url = '?height=' + winmine.height + '&width=' + winmine.width + '&mines=' + winmine.mine_count + '&board_mines=' + JSON.stringify(winmine.mines) + '&board_backup_mine=' + winmine.backup_y + '_' + winmine.backup_x;
			window.location = play_again_url;
		}

		else if(action_name === 'stats-button') {
			const game_stats_elem = document.getElementsByClassName('game-over-stats-frame')[0];
			const stats_tbody = document.querySelector('.game-over-stats > table > tbody');
			if(winmine.display_game_stats || false) {
				winmine.display_game_stats = false;
				game_stats_elem.classList.remove('game-over-stats-enabled');
				stats_tbody.innerText = '';
				return;
			}
			winmine.display_game_stats = true;
			game_stats_elem.classList.add('game-over-stats-enabled');
			const board_label = function(board) {
				if(board == winmine.setting.beginner2) { return 'Beg.'; }
				else if(board == '16x16/40') { return 'Int.'; }
				else if(board == '16x30/99') { return 'Exp.'; }
				else return board;
			};
			const result_label = (winmine.game_win) ? 'Win' : 'Loss';
			const duration = (winmine.game_over) ? parseFloat(winmine.game_duration) : parseFloat(winmine.get_game_duration(3));
			const stats = {
				'Result': (winmine.game_over) ? result_label : '-',
				'Board': board_label('' + winmine.height + 'x' + winmine.width + '/' + winmine.mine_count),
				'Time': duration,
				'3BV': winmine._3bv,
				'3BV/s': (winmine._3bv / duration).toFixed(2),
				'RQP': (duration / (winmine._3bv / duration)).toFixed(0),
				'Flags used': winmine.flagged_cells.length,
				'Clicks': winmine.game_clicks.length,
				'Left clicks': winmine.game_clicks.filter(x => ['l'].includes(x[1])).length,
				'Multi clicks': winmine.game_clicks.filter(x => ['m'].includes(x[1])).length,
				'Right clicks': winmine.game_clicks.filter(x => ['f','q','c'].includes(x[1])).length
			};
			const stats_keys = Object.keys(stats);
			for(var i = 0; i < stats_keys.length;i++) {
				stats_tbody.insertRow(-1);
				const new_row = stats_tbody.rows[i];
				new_row.insertCell(0);
				new_row.cells[0].innerHTML = stats_keys[i];
				new_row.insertCell(1);
				new_row.cells[1].innerHTML = stats[stats_keys[i]];
			}
			winmine.remove_game_stats = function(e) {
				if(['TABLE','TBODY','TR','TD'].includes(e.target.nodeName)) { return; }
				winmine.display_game_stats = false;
				game_stats_elem.classList.remove('game-over-stats-enabled');
				stats_tbody.innerText = '';
			};
			game_stats_elem.addEventListener('mouseleave', winmine.remove_game_stats);
		}
	});

	document.getElementsByClassName('is-prev-game-menu-item')[0].addEventListener('mouseup', function(event) {
		const action_name = event.target.getAttribute('data-is-prev-game-menu');
		if(action_name === 'try-again-button') {
			window.location.reload();
		}
	});

	document.getElementsByClassName('content-game-history-context')[0].addEventListener('mouseup', function(event) {
		if(event.target.hasAttribute('data-action-url')) {
			const new_window_url = event.target.getAttribute('data-action-url');
			const width = new_window_url.match(/width=(.*?)&/)[1];
			const height = new_window_url.match(/height=(.*?)&/)[1];
			const window_width = (width*winmine.setting.x_px)+20;
			const window_height = (height*winmine.setting.y_px)+83;
			const new_window_salt = winmine.random(100000,999999);
			window.open(new_window_url, 'Replay' + '_' + new_window_salt, 'width= ' + window_width + ',height=' + window_height + ',top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
			document.getElementsByClassName('content-game-history-context')[0].classList.remove('content-game-history-context-enabled');
			winmine.game_history_table_context_row.classList.remove('content-game-history-context-row-enabled');
		}
	});

	/* catch the close button for any enabled item within feature-content-frame and remove any etc'-enabled' class */
	document.getElementsByClassName('feature-content-frame')[0].addEventListener('mouseup', function(event) {
		const feature_content_frame = document.getElementsByClassName('feature-content-frame')[0];
		if(event.target.classList.contains('content-escape-button')) {
			feature_content_frame.classList.remove('feature-content-enabled');
			const parent_classes = event.target.parentNode.parentNode.classList;
				parent_classes.forEach(function(c) {
				if(c.includes('-enabled')) {
					parent_classes.remove(c);
				}
			});
		}
	});


	/* end document load events: */
	/* trigger game rewatch replay if in replay mode */
	if(winmine.replay_mode & winmine.replay_autoplay) {
		document.querySelector('[data-replay-menu="play-pause-button"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	}

});