/* Created by Anthony Fucci (thefucci@_@gmail.com) */
/* (GPL-3.0) */

var winmine = {};

winmine.load_board_settings = function() {
	const url_parameters = new URLSearchParams(window.location.search);
	if(url_parameters.has('height') && url_parameters.has('width') && url_parameters.has('mines')) {
		winmine.height = parseInt(url_parameters.get('height'));
		winmine.width = parseInt(url_parameters.get('width'));
		winmine.mine_count = parseInt(url_parameters.get('mines'));
	} else {
		winmine.height = 8;
		winmine.width = 8;
		winmine.mine_count = 10;
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

winmine.start_timer = async function() {
	this.sleep = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};
	postMessage('1'); /* winmine version starts at 1 */
	while(true) {
		await sleep(1000);
		let since_start = performance.now();
		since_start = since_start + 1000;
		since_start = Math.round(since_start/1000);
		postMessage(since_start.toString());
	}
};
winmine.start_timer_function_text = '(' + winmine.start_timer.toString() + ')()';
winmine.start_timer_function_blob = new Blob([winmine.start_timer_function_text], {type: 'application/javascript'});

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

/* some smaller data are stored in the key so we can do some searching without looping through storage values */
/* key: pipe-separated array ex: 'w|height,width,mines|3BV|game_duration|game_end_time' */
/* value: stringify array 1st item is name, 2nd item is mine cell positions, 3rd item is game_clicks array, a 3-length array of user game cell actions: duration,action,cell_id */
winmine.save_record = function() {
	const game_config = [winmine.height, winmine.width, winmine.mine_count].toString();
	const game_win_loss = (winmine.game_win) ? 'w' : 'l';
	/* look through existing storage key names for (w)in records matching the game board config array string. then check if current game time bests them all */
	let keys_to_search = Object.keys({ ...localStorage }).filter(value => 'w' + value.split('|')[1] === 'w' + game_config);
	if(['8,8,10', '16,16,40', '16,30,99'].includes(game_config)) {
		let best_times_cleared_on = localStorage.getItem('setting_best_times_cleared_on');
		best_times_cleared_on = (best_times_cleared_on === null) ? Date.parse('1990-01-01') : Date.parse(best_times_cleared_on);
		keys_to_search = keys_to_search.filter(x => Date.parse(x.split('|')[5]) > best_times_cleared_on);
	}
	let records_beat = 0;
	keys_to_search.forEach(function(item) {
		if(winmine.game_duration < parseInt(item.split('|')[4], 10)) {
			records_beat++;
		}
	});
	const is_best_time = records_beat === keys_to_search.length;
	/* set this function up so we can save record before prompting for a name, and then save again if we get a name */
	winmine.save_record_name = function(name) {
		const storage_key_base =
			game_win_loss + '|' +
			game_config + '|' +
			winmine._3bv + '|' +
			winmine.game_clicks.filter(x => ['l','m'].includes(x[1])).length + '|' +
			winmine.game_duration + '|' +
			winmine.game_end_time;
		const storage_key_old = storage_key_base + '|' + 'Anonymous';
		const storage_key = storage_key_base + '|' + name.replace('|',''); /* simply don't allow special key name array separator character | */
		const storage_value = JSON.stringify([winmine.mines, winmine.game_clicks]);
		localStorage.removeItem(storage_key_old);
		localStorage.setItem(storage_key, storage_value);	
	};
	/* save every win, not just best time, until this is more thought out or configurable */
	winmine.save_record_name('Anonymous');
	if(is_best_time) {
		let difficulty = winmine.height + 'x' + winmine.width + ' ' + winmine.mine_count + ' mine ';
		if(game_config === '8,8,10')   { difficulty = 'Beginner'; }
		if(game_config === '16,16,40') { difficulty = 'Intermediate'; }
		if(game_config === '16,30,99') { difficulty = 'Expert'; }
		document.getElementsByClassName('content-best-time-game-header')[0].innerHTML = 'You have the fastest time\nfor ' + difficulty + ' level.\nPlease enter your name.';
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-best-time-game')[0].classList.add('content-best-time-game-enabled');
		document.querySelector('.content-best-time-game-input > input').select();
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
	return([parseInt(as_array[0]), parseInt(as_array[1])]);
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

/* for assigning mines */
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
				/* console.log('row: ', i, ";  col: ", j); */
				winmine._3bv++;
				winmine.flood_fill(i, j);
			}
		}
	}
	/* console.log('_3bv: ', winmine._3bv); */
	/* console.log('cell_total: ', winmine.cell_total); */
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

	/* create mine array */
	winmine.mines = [];
	winmine.y_ceil = winmine.height - 1;
	winmine.x_ceil = winmine.width - 1;
	for (let mine = 0; winmine.mines.length < (winmine.mine_count+1); mine += 1) {
		let y = winmine.random(0,(winmine.height-1));
		let x = winmine.random(0,(winmine.width-1));
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
	}
};

winmine.choose_cell = function(cell_html_id) {
	if(performance.getEntriesByName('game_start').length === 0) {
		performance.mark('game_start');
		winmine.timer_worker = new Worker(URL.createObjectURL(winmine.start_timer_function_blob));
		winmine.timer_worker.onmessage = function(event) {
			winmine.set_timer(event.data);
		}
	}
	const cell_element = document.getElementById(cell_html_id);
	if(cell_element.classList.contains('clear')) {
		return;
	}
	cell_element.classList.add('clear');
	const coords = winmine.id_as_y_x(cell_html_id);
	const y = parseInt(coords[0], 10);
	const x = parseInt(coords[1], 10);
	const cell_id_string = y+'_'+x;

	const game_click_code = (winmine.multi_cell) ? 'm': 'l';
	winmine.game_clicks.push([winmine.get_game_duration(1), game_click_code, cell_id_string]);
	
	/* 1. if cell is a mine and at least one cell has been chosen (not first click), game over */
	if(winmine.cells[y][x] == 9) {
		if(winmine.cleared > 0) {
			winmine.game_duration = winmine.get_game_duration(3);
			winmine.timer_worker.terminate();
			winmine.game_over = true;
			winmine.game_win = false;
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
		}
	}

	/* 2. this function sets the appropriate css classes and uses the same recursion method used to get 3BV  */
	winmine.clear_mine_field(y, x);

	/*  3. consider win */
	if(winmine.cleared >= (winmine.height*winmine.width-winmine.mine_count)) {
		winmine.game_duration = winmine.get_game_duration(3);
		winmine.timer_worker.terminate();
		winmine.game_over = true;
		winmine.game_win = true;
		const smiley_frame = document.getElementsByClassName('smiley-container')[0];
		smiley_frame.classList.remove('face-neutral');
		smiley_frame.classList.add('face-game-win');
		const unflagged_mines = winmine.mines.filter(x => !winmine.flagged_cells.includes(x));
		for (let i = 0; i < unflagged_mines.length; i += 1) {
			const elem_id = unflagged_mines[i];
			const elem = document.getElementById('cell_' + elem_id);
			elem.classList.add('flag');
		}
		winmine.set_mine_counter(0);
		winmine.game_end_time = (new Date(Date.now())).toISOString();
		winmine.save_record();
		document.getElementsByClassName('scoreboard-digits-container')[1].title = winmine.game_duration;
		return;
	}
};

winmine.flag_cell = function(cell_html_id) {
	const cell_id_string = cell_html_id.substring(5);
	const coords = winmine.id_as_y_x(cell_html_id);
	const cell_element = document.getElementById(cell_html_id);
	const is_flagged = cell_element.classList.contains('flag');
	const is_marked = cell_element.classList.contains('question') && winmine.marks;
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
		if(winmine.marks) {
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
	if(winmine.height === 8 && winmine.width === 8 && winmine.mine_count === 10) {
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
	if(localStorage.getItem('setting_marks') === null) {
		winmine.marks = true; /* winmine.exe default */
	} else {
		winmine.marks = (localStorage.getItem('setting_marks') === 'true') ? true : false;
	}
	if(winmine.marks) {
		document.querySelector('.menu-item[data-name=\'Marks (?)\']').classList.add('menu-mark');
	}
	if(localStorage.getItem('setting_color') === null) {
		winmine.color = true; /* winmine.exe default */
	} else {
		winmine.color = (localStorage.getItem('setting_color') === 'true') ? true : false;
	}
	if(winmine.color) {
		document.querySelector('.menu-item[data-name=\'Color\']').classList.add('menu-mark');
	} else {
		document.documentElement.style.setProperty('filter', 'grayscale(100%)');
	}
	if(localStorage.getItem('setting_extra_menu') === null) {
		winmine.extra_menu = true;
	} else {
		winmine.extra_menu = (localStorage.getItem('setting_extra_menu') === 'true') ? true : false;
	}
	if(winmine.extra_menu) {
		document.querySelector('.menu-item[data-name=\'Extra Menu*\']').classList.add('menu-mark');
		document.getElementsByClassName('extra-menu-frame')[0].style.display = 'inline-block';
	}
};

winmine.get_most_common_item_in_array = function(array_of_items) {
	let max_count = 1;
	let freq = 0;
	let max_item;
	for (let i=0; i<array_of_items.length; i++)
	{
		for (let j=i; j<array_of_items.length; j++)
		{
			if (array_of_items[i] == array_of_items[j]) {
				freq++;
			}
			if (max_count < freq)
			{
				max_count = freq; 
				max_item = array_of_items[i];
			}
		}
		freq = 0;
	}
	return(max_item);
};

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
	let a = _a.cells[winmine.sort_table_col_idx].innerText;
	let b = _b.cells[winmine.sort_table_col_idx].innerText;
	a = a.replace(/\,/g, '');
	b = b.replace(/\,/g, '');
	if(winmine.sort_table_asc) {
		let temp = a;
		a = b;
		b = temp;
	}
	/* if(a.match(/^[0-9]+$/) && b.match(/^[0-9]+$/)) { */
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
/* this defines the order for how data is saved to localStorage and saved/imported for csv, important because data items/objects aren't named when saved to localStorage (byte saving) */
winmine.localStorage_key_items = {
	'outcome': 'w',
	'board': '8x8(10)',
	'3bv': '4',
	'clicks': '6',
	'duration': '5.305',
	'timestamp': '2021-04-15T14:35:57.299Z',
	'name': 'Anonymous'
};
winmine.localStorage_value_items = {
	'mines': '["2_5","1_5","2_7","1_6","5_2","0_7","1_7","4_5","0_0","2_6"]',
	'action_replay': '[["0.0","l","0_6"],["0.3","l","3_6"],["0.5","l","4_4"],["0.7","l","3_2"],["2.0","f","5_2"],["2.9","f","4_5"],["3.4","m","3_5"],["3.8","f","2_5"],["4.7","f","1_5"],["5.3","m","0_5"]]'
};
winmine.save_game_history = function() {
	let csv_content = 'data:text/csv;charset=utf-8,'
	const header = Object.keys(winmine.localStorage_key_items).join(',') + ',' + Object.keys(winmine.localStorage_value_items).join(',');
	csv_content += header + '\r\n';
	const winning_keys = Object.keys({ ...localStorage }).filter(x => x.substring(0,2)==='w|');
	winning_keys.forEach(function(key_name) {
		const key_name_arr = key_name.split('|');
		/* construct csv, escape double quotes */
		let row = key_name_arr.map(function(item) { return('\"' + item.replace(/"/g, '\"\"') + '\"'); }).join(',');
		const value_items =	JSON.parse(localStorage.getItem(key_name)); /* look up rest of items stored in localStore item */
		row += ',' + value_items.map(function(item) { return('\"' + JSON.stringify(item).replace(/"/g, '\"\"') + '\"'); }).join(',');
		csv_content += row + "\r\n";
	});
	const encoded_uri = encodeURI(csv_content);
	const link = document.createElement("a");
	link.setAttribute("href", encoded_uri);
	link.setAttribute("download", "winmine_history.csv");
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
		const localStorage_item_things = things_to_save.slice(variables_in_key_name.length, expected_column_names.length).map(function(x) { return JSON.parse(x); }); /* item values are stored with JSON.stringify */
		localStorage.setItem(localStorage_key_things.join('|'), JSON.stringify(localStorage_item_things));
	}
	/* trigger a close-reopen of the game history menu content for a refresh effect */
	document.querySelector('.content-game-history .content-escape-button').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	document.querySelector('[data-name="Game History"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
	alert('✔️ ' + not_header.length + ' game records imported')
};

winmine.fill_game_history_table = function(tbody, select_option_value) {
	tbody.textContent = ''; /* keep it simple and just delete all the table records each new request */
	let hist = winmine.hist;
	/* board has pattern of two commas */
	if(select_option_value.split(',').length-1 === 2) {
		hist = hist.filter(item => item[1] === select_option_value);
	}
	if(hist.length === 0) {
		document.getElementsByClassName('content-game-history-no-history')[0].classList.add('content-game-history-no-history-enabled');
	} else {
		document.getElementsByClassName('content-game-history-no-history')[0].classList.remove('content-game-history-no-history-enabled');
	}
	for (let i = 0; i < hist.length; i++) {
		const h = hist[i];
		/* name items for sanity */
		const board = h[1];
		const _3bv = h[2];
		const clicks = h[3];
		const time = h[4];
		const datetime = h[5];
		tbody.insertRow(-1);
		const new_row = tbody.rows[i];
		new_row.insertCell(0);
		new_row.cells[0].innerHTML = board;
		new_row.insertCell(1);
		new_row.cells[1].innerHTML = _3bv;
		new_row.cells[1].title = clicks + ' / ' + _3bv;
		new_row.insertCell(2);
		new_row.cells[2].innerHTML = time;
		new_row.insertCell(3);
		new_row.cells[3].innerHTML = datetime.substring(2,10);
		new_row.insertCell(4);
		new_row.cells[4].innerHTML = (_3bv / time).toFixed(2);
		new_row.insertCell(5);
		new_row.cells[5].innerHTML = (time / (_3bv / time)).toFixed(0);
	}
};

winmine.select_menu_item = function(event) {
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

	const item_text = event.target.getAttribute('data-name');
	if(item_text === 'New') {
		location.reload();
		return;
	}
	if(item_text === 'Beginner') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height=8&width=8&mines=10', 'Beginner' + '_' + new_window_salt, 'width=148,height=211,top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
		return;
	}
	if(item_text === 'Intermediate') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height=16&width=16&mines=40', 'Intermediate' + '_' + new_window_salt, 'width=276,height=339,top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
		return;
	}
	if(item_text === 'Expert') {
		const new_window_salt = winmine.random(100000,999999);
		window.open('?height=16&width=30&mines=99', 'Expert' + '_' + new_window_salt, 'width=500,height=339,top=' + (window.screenY+50) + ',left=' + (window.screenX+50));
		return;
	}
	if(item_text === 'Custom...') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-custom-game')[0].classList.add('content-custom-game-enabled');
		let saved_custom_field_settings = JSON.parse(localStorage.getItem('setting_custom_field'));
		if(saved_custom_field_settings === null) {
			saved_custom_field_settings = [8,8,10];
		}
		document.getElementsByClassName('custom-game-field')[0].value = saved_custom_field_settings[0];
		document.getElementsByClassName('custom-game-field')[1].value = saved_custom_field_settings[1];
		document.getElementsByClassName('custom-game-field')[2].value = saved_custom_field_settings[2];
		return;
	}
	if(item_text === 'Marks (?)') {
		if(event.target.classList.contains('menu-mark')) {
			event.target.classList.remove('menu-mark');
			localStorage.setItem('setting_marks', 'false');
			winmine.marks = false;
			winmine.marked_cells.forEach(function(item) {
				document.getElementById('cell_'+item).classList.remove('question');
			});
			winmine.marked_cells = [];
		} else {
			event.target.classList.add('menu-mark');
			localStorage.setItem('setting_marks', 'true');
			winmine.marks = true;
		}
		return;
	}
	if(item_text === 'Color') {
		if(event.target.classList.contains('menu-mark')) {
			event.target.classList.remove('menu-mark');
			document.documentElement.style.setProperty('filter', 'grayscale(100%)');
			localStorage.setItem('setting_color', 'false');
			winmine.color = false;
		} else {
			event.target.classList.add('menu-mark');
			document.documentElement.style.removeProperty('filter');
			localStorage.setItem('setting_color', 'true');
			winmine.color = true;
			
		}
		return;
	}
	if(item_text === 'Best Times...') {
		const classic_best_times_row_html = function(saved_key_names, difficulty) {
			let difficulty_config = '';
			if(difficulty === 'beginner') {	difficulty_config = '8,8,10';	}
			if(difficulty === 'intermediate') {	difficulty_config = '16,16,40';	}
			if(difficulty === 'expert') {	difficulty_config = '16,30,99';	}
			let best_times_cleared_on = localStorage.getItem('setting_best_times_cleared_on');
			best_times_cleared_on = (best_times_cleared_on === null) ? Date.parse('1990-01-01') : Date.parse(best_times_cleared_on);
			let result = saved_key_names.filter(value => 'w|' + value.split('|')[1] + '|' === 'w|' + difficulty_config + '|')
				.filter(value => Date.parse(value.split('|')[5]) > best_times_cleared_on);
			const best_time_idx = Math.min.apply(null, result.map(function(x){return x.split('|')[4]; })).toFixed(3);
			result = result[result.findIndex(x => x.split('|')[4] === best_time_idx)];
			result = (typeof(result)=='undefined') ? 'w|-1|-1|-1|999|-1|Anonymous'.split('|') : result.split('|');
			const record_difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)+':';
			const record_score = (winmine.width > 12) ? Math.round(result[4]) + ' seconds' : Math.round(result[4]);
			const record_name = (/* winmine.width < 12 */false) ? result[6].substring(0,4) : result[6];
			return('<div>' + record_difficulty + '</div><div title=\"'+result[4]+' seconds\">' + record_score + '</div><div>' + record_name + '</div>');
		};
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-best-times')[0].classList.add('content-best-times-enabled');
		const keys_to_search = Object.keys({ ...localStorage });
		const table = document.getElementsByClassName('content-best-times-table')[0];
		table.innerHTML = classic_best_times_row_html(keys_to_search, 'beginner') + classic_best_times_row_html(keys_to_search, 'intermediate') + classic_best_times_row_html(keys_to_search, 'expert');
		return;
	}
	if(item_text === 'Exit') {
		window.close();
		return;
	}
	if(item_text === 'Contents') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-help-contents')[0].classList.add('content-help-contents-enabled');
		return;
	}
	if(item_text === 'About Minesweeper...') {
		event.target.parentNode.classList.remove('menu-container-top');
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-about')[0].classList.add('content-about-enabled');
		return;
	}
	if(item_text === 'Extra Menu*') {
		const extra_menu = document.getElementsByClassName('extra-menu-frame')[0];
		if(event.target.classList.contains('menu-mark')) {
			extra_menu.style.display = 'none';
			event.target.classList.remove('menu-mark');
			localStorage.setItem('setting_extra_menu', 'false');
		} else {
			extra_menu.style.display = 'inline-block';
			event.target.classList.add('menu-mark');
			localStorage.setItem('setting_extra_menu', 'true');
		}
		return;
	}
	if(item_text === 'Game History') {
		document.getElementsByClassName('feature-content-frame')[0].classList.add('feature-content-enabled');
		document.getElementsByClassName('content-game-history')[0].classList.add('content-game-history-enabled');
		document.getElementsByClassName('content-game-history-delete')[0].classList.remove('content-game-history-delete-enabled');
		const winning_keys = Object.keys({ ...localStorage }).filter(x => x.substring(0,2)==='w|');
		/* stop here if history object still matches localStorage */
		if(winning_keys.length === winmine.hist.length) {
			return;
		} else {
			winmine.hist = [];
		}
		const hist_datetimes = [];
		winning_keys.forEach(function(item, index) {
			winmine.hist.push(index);
			const new_item = item.split('|');
			winmine.hist[index] = new_item;
			hist_datetimes.push(new_item[5]);
		});
		const unique_boards = [];
		winmine.hist.forEach(function(item) { if(!unique_boards.includes(item[1])) { unique_boards.push(item[1]); }});
		const select_element = document.getElementsByClassName('content-game-history-select')[0];
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
				if(!['8,8,10','16,16,40','16,30,99'].includes(item)) {
					select_element.options.add(new Option(item, item));
					select_element.options[select_element.options.length-1].classList.add('select-option-is-new');
				}
			});
		}

		const sorted = hist_datetimes.slice().sort(function(a, b) {
			return new Date(a) - new Date(b);
		});
		const recent_games_datetimes = sorted.slice(-5);
		const recent_games = winmine.hist.filter(i => recent_games_datetimes.includes(i[5]));
		const recent_games_boards = []; recent_games.forEach(function(item) { recent_games_boards.push(item[1]); });
		const recent_board = winmine.get_most_common_item_in_array(recent_games_boards);

		select_element.value = recent_board;
		select_element.dispatchEvent(new Event('change'));
		return;
	}
};

/* Create all the javascript event listeners once <html> DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function() {
	winmine.load_board_settings();
	winmine.create_mine_field();
	winmine.set_3bv();
	winmine.insert_seven_segment_elements();
	winmine.init_counter(winmine.mine_count);
	winmine.init_timer();
	winmine.set_file_menu_item_marks();

	winmine.cleared = 0; /* clear_mine_field() increments this to determine game win */
	winmine.flagged_cells = []; /* cells are pushed here contextmenu (right click) */
	winmine.marked_cells = []; /* another right click contextmenu, for question mark cells */
	winmine.game_clicks = []; /* record actions for game save/replay */
	winmine.game_over = false;
	winmine.hist = [];

	/* file menu container events are delegated from the menu item container */
	document.getElementsByClassName('file-menu')[0].addEventListener('mouseup', function(event) {
		if(event.target.classList.contains('menu-item')) {
			winmine.select_menu_item(event);
		}
	});

	/* prevent default right click on everything below file menu */
	document.querySelector('.game-window-frame').addEventListener('contextmenu', function(event) {
		event.preventDefault();
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
		if(event.button === 0) { winmine.mouse_is_down = true; }
		if(event.button === 2) { winmine.mouse2_is_down = true; }
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
		/* mouseup is managing the two ways two clear cell(s), direct left click or indirect left+right click */
		if(event.button === 0) { winmine.mouse_is_down = false; }
		if(event.button === 2) { winmine.mouse2_is_down = false; }
		if(winmine.multi_cell) {
			if(event.target.classList.length >= 2) {
				const coords = winmine.id_as_y_x(event.target.id);
				const neighboring_cells = winmine.get_array_of_neighbor_ids(coords[0], coords[1]);
				const flagged_neighboring_cells = [];
				document.querySelectorAll('#cell_' + neighboring_cells.join(',#cell_')).forEach(function (element) {
					if(element.classList.contains('flag')) {
						flagged_neighboring_cells.push(element.id.substring(5));
					}
					element.classList.remove('active');
				});
				if(flagged_neighboring_cells.length == event.target.classList[1].substring(1)) {
					const cells_to_choose = neighboring_cells.filter(x => !flagged_neighboring_cells.includes(x));
					cells_to_choose.forEach(function (element) {
						const e = document.getElementById('cell_'+element);
						if(e.classList.contains('clear')) { return; }
						winmine.choose_cell('cell_'+element);
						e.classList.remove('question'); /* marked cells are triggered like normal cells. remove class to prevent confusion */
					});
				}
			} else {
				const coords = winmine.id_as_y_x(event.target.id);
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
		if(event.button === 2) { return; }
		if(event.target.classList.contains('flag')) { return; }
		if(event.target.classList.contains('question')) { return; }
		event.target.classList.remove('active');
		winmine.choose_cell(event.target.id);
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
			location.reload();
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
	document.body.addEventListener('mousedown', function(event) {
		if(!['INPUT','SELECT'].includes(event.target.nodeName)) {
			event.preventDefault(); /* prevent browser from displaying the 'not allowable' cursor and trying to html draggable-item things */
		}
		if(event.button === 2 && !winmine.multi_cell) { return; }
		if(winmine.game_over === false && !event.target.classList.contains('smiley-container')) {
			smiley_frame.classList.remove('face-neutral');
			smiley_frame.classList.add('face-cursor-down');
		}
	});
	/* winmine.exe would remember your mouse button was down even if you left the window, as long as it stayed in focus. not sure this is possible in browser */
	document.body.addEventListener('mouseleave', function(event) {
		if(event.button === 2) { return; }
		winmine.mouse_is_down = false;
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
		let height = document.getElementsByClassName('custom-game-field')[0].value;
		let width = document.getElementsByClassName('custom-game-field')[1].value;
		let mines = document.getElementsByClassName('custom-game-field')[2].value;
		if(height < 4)  { height = 4; }
		if(width  < 4)  { width = 4; }
		if(height > 999) { height = 999; }
		if(width  > 999) { width = 999; }
		if(mines < 1)  { mines = 1 }
		if(mines > ((height*width)-1)) { mines = (height*width)-1; }
		localStorage.setItem('setting_custom_field', JSON.stringify([height, width, mines]));
		const new_window_salt = winmine.random(100000,999999);
		const window_width = (width*16)+20;
		const window_height = (height*16)+83;
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
		localStorage.setItem('setting_best_times_cleared_on', new Date(Date.now()).toISOString());
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
			const keys_to_delete = Object.keys({ ...localStorage }).filter(function(x) { return x.split('|')[1] === target_board });
			for(const key_name of keys_to_delete) {
				localStorage.removeItem(key_name);
			}
 			document.querySelector('.content-game-history .content-escape-button').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
			document.querySelector('[data-name="Game History"]').dispatchEvent(new Event('mouseup', { 'bubbles': true }));
		} else if(item_text === 'game-delete-every-board') {
			const keys_to_delete = Object.keys({ ...localStorage }).filter(function(x) { return ['w|','l|'].includes(x.substring(0,2)); })
			for(const key_name of keys_to_delete) {
				localStorage.removeItem(key_name);
			}
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
});