/* Created by Anthony Fucci (thefucci@_@gmail.com) */
/* (GPL-3.0) */

var winmine = {};
winmine.height = 8;
winmine.width = 8;
winmine.mine_count = 6;

winmine.get_array_of_neighbor_cells = function(cell_id_string) {
	const triggered_cell = cell_id_string.split('_');
	const triggered_cell_row = parseInt(triggered_cell[0], 10);
	const triggered_cell_col = parseInt(triggered_cell[1], 10);
	const top_left			= [triggered_cell_row - 1, triggered_cell_col - 1];
	const top_middle		= [triggered_cell_row - 1, triggered_cell_col];
	const top_right			= [triggered_cell_row - 1, triggered_cell_col + 1];
	const middle_left		= [triggered_cell_row, triggered_cell_col - 1];
	/* middle_self			= [triggered_cell_row, triggered_cell_col]; */
	const middle_right	= [triggered_cell_row, triggered_cell_col + 1];
	const bottom_left		= [triggered_cell_row + 1, triggered_cell_col - 1];
	const bottom_middle	= [triggered_cell_row + 1, triggered_cell_col];
	const bottom_right	= [triggered_cell_row + 1, triggered_cell_col + 1];
	const neighbor_cell_array = [top_left, top_middle, top_right, middle_left, middle_right, bottom_left, bottom_middle, bottom_right];
	const return_array = [];
	for (let i = 0; i < neighbor_cell_array.length; i += 1) {
		const cell_positions = neighbor_cell_array[i];
		const cell_string = cell_positions.join('_');
		const cell_position_row = cell_positions[0];
		const cell_position_col = cell_positions[1];
		if(cell_position_row >= 0
			&& cell_position_row < winmine.height
			&& cell_position_col >= 0
			&& cell_position_col < winmine.width
			&& !winmine.triggered_cells.includes(cell_string)) /* decide here not to return already-triggered cells */
		{
			return_array.push(cell_string);
		}
	}
	return(return_array);
}

winmine.get_array_of_neighboring_mines = function(array_of_neighbor_cells) {
	const neighbor_mines = [];
	for (let i = 0; i < array_of_neighbor_cells.length; i += 1) {
		if(winmine.mines.includes(array_of_neighbor_cells[i])) {
			neighbor_mines.push(array_of_neighbor_cells[i]);
		}
	}
	return(neighbor_mines);
}

winmine.random = function(min, max) {
	const range = max - min + 1
	const bits_needed = Math.ceil(Math.log2(range))
	const bytes_needed = Math.ceil(bits_needed / 8)
	const cutoff = Math.floor((256 ** bytes_needed) / range) * range
	const bytes = new Uint8Array(bytes_needed)
	let value
	do {
			crypto.getRandomValues(bytes)
			value = bytes.reduce((acc, x, n) => acc + x * 256 ** n, 0)
	} while (value >= cutoff)
	return min + value % range
}

winmine.load_config = function() {
	const url_parameters = new URLSearchParams(window.location.search);
	if(url_parameters.has('height') && url_parameters.has('width') && url_parameters.has('mines')) {
		winmine.height = parseInt(url_parameters.get('height'));
		winmine.width = parseInt(url_parameters.get('width'));
		winmine.mine_count = parseInt(url_parameters.get('mines'));
	}
}

winmine.set_file_menu_item_marks = function() {
	let game_is_custom = true;
	if(winmine.height === 8 && winmine.width === 8 && winmine.mine_count === 10) {
		document.querySelectorAll('.menu-item[data-name=\'Beginner\']')[0].classList.add('menu-mark');
		game_is_custom = false;
	}
	if(winmine.height === 16 && winmine.width === 16 && winmine.mine_count === 40) {
		document.querySelectorAll('.menu-item[data-name=\'Intermediate\']')[0].classList.add('menu-mark');
		game_is_custom = false;
	}
	if(winmine.height === 16 && winmine.width === 30 && winmine.mine_count === 99) {
		document.querySelectorAll('.menu-item[data-name=\'Expert\']')[0].classList.add('menu-mark');
		game_is_custom = false;
	}
	if(game_is_custom === true) {
		document.querySelectorAll('.menu-item[data-name=\'Custom...\']')[0].classList.add('menu-mark');
	}
}

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
	/* const seven_container = document.querySelector('.seven-container'); */
	const seven_container = document.getElementById(seven_container_html_id);
	for (let i = 1; i < ((seven_height*seven_width)+1); i += 1) {
		const cell_div = document.createElement('div');
		if(winmine.sevseg.a_cells.includes(i)) { cell_div.classList.add("A7"); }
		if(winmine.sevseg.b_cells.includes(i)) { cell_div.classList.add("B7"); }
		if(winmine.sevseg.c_cells.includes(i)) { cell_div.classList.add("C7"); }
		if(winmine.sevseg.d_cells.includes(i)) { cell_div.classList.add("D7"); }
		if(winmine.sevseg.e_cells.includes(i)) { cell_div.classList.add("E7"); }
		if(winmine.sevseg.f_cells.includes(i)) { cell_div.classList.add("F7"); }
		if(winmine.sevseg.g_cells.includes(i)) { cell_div.classList.add("G7"); }
		if(winmine.sevseg.style1_cells.includes(i)) { cell_div.classList.add("x7"); }
		if(winmine.sevseg.style2_cells.includes(i)) { cell_div.classList.add("y7"); }
		seven_container.append(cell_div);
	}
	const grid_template_rows = 'auto '.repeat(seven_height);
	const grid_template_columns = 'auto '.repeat(seven_width);
	seven_container.style.setProperty('grid-template-rows', grid_template_rows);
	seven_container.style.setProperty('grid-template-columns', grid_template_columns);
}

winmine.sevseg.get_segment_array = function(int) {
	if(int==='0') { return(['A','B','C','D','E','F']); }
	if(int==='1') { return(['B','C']); }
	if(int==='2') { return(['A','B','D','E','G']); }
	if(int==='3') { return(['A','B','C','D','G']); }
	if(int==='4') { return(['B','C','F','G']); }
	if(int==='5') { return(['A','C','D','F','G']); }
	if(int==='6') { return(['A','C','D','E','F','G']); }
	if(int==='7') { return(['A','B','C']); }
	if(int==='8') { return(['A','B','C','D','E','F','G']); }
	if(int==='9') { return(['A','B','C','D','F','G']); }
	if(int==='-') { return(['G']); }
}

winmine.insert_seven_segment_elements = function() {
	const seven_elements = ["counter0","counter1","counter2",
		"timer0","timer1","timer2"];
	for (let i = 0; i < seven_elements.length; i += 1) {
		winmine.sevseg.fill_seven_segment_container(seven_elements[i]);
	}
}

winmine.sevseg.assign_segments = function(container_html_id, position, new_number) {
	const counter_id = container_html_id + position;
	document.querySelectorAll('#' + counter_id + ' > div').forEach(function (element) {
		element.classList.remove('the-red');
	});
	const segment_array = winmine.sevseg.get_segment_array(new_number);
	const css_selector = '#' + counter_id + ' > .' + segment_array.join('7, #' + counter_id + ' > .').concat('7');
	document.querySelectorAll(css_selector).forEach(function (element) {
		element.classList.add('the-red');
	});
}

winmine.init_counter = function(mine_number) {
	mine_number = mine_number.toString().padStart(3, 0);
	for(let i = 0; i < mine_number.length; i += 1) {
		winmine.sevseg.assign_segments('counter', i, mine_number.charAt(i))
	}
	winmine.counter = mine_number;
}

winmine.init_timer = function() {
	const timer_value = '000';
	for(let i = 0; i < timer_value.length; i += 1) {
		winmine.sevseg.assign_segments('timer', i, timer_value.charAt(i))
	}
}

winmine.set_mine_counter = function(remaining_mines) {
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
}


winmine.start_timer = async function() {
/* 	self.onmessage = function(e) {
  	console.log('Message received from main script');
		console.log(e);
	} */
	this.sleep = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	while(true) {
		await sleep(1000);
		postMessage(Math.round(performance.now()/1000).toString());
	}
}
winmine.start_timer_function_text = "(" + winmine.start_timer.toString() + ")()";
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
}

winmine.fill_cell_container = function(height, width) {
	/* create global cells index, an array of row column ids (row_col) */
	winmine.cells = [];
	for (let row = 0; row < height; row += 1) {
		for (let col = 0; col < width; col += 1) {
			winmine.cells.push([row, col].join("_"));
		}
	}

	winmine.triggered_cells = []; /* cells are pushed here onmouseup */
	winmine.flagged_cells = []; /* cells are pushed here contextmenu (right click) */
	winmine.marked_cells = []; /* another right click contextmenu, for question mark cells */

	/* create html div grid cells */
	const cell_container = document.querySelector('.cell-container');
	for (let i = 0; i < winmine.cells.length; i += 1) {
		const cell_div = document.createElement('div');
		cell_div.id = 'cell_'.concat(winmine.cells[i]);
		cell_container.append(cell_div);
	}
	const grid_template_rows = 'auto '.repeat(height);
	const grid_template_columns = 'auto '.repeat(width);
	cell_container.style.setProperty('grid-template-rows', grid_template_rows);
	cell_container.style.setProperty('grid-template-columns', grid_template_columns);

	/* create mine array */
	winmine.mines = [];
	while(winmine.mines.length < winmine.mine_count) {
		let random_int = winmine.random(0,(winmine.cells.length-1));
		if(!winmine.mines.includes(winmine.cells[random_int])) {
			winmine.mines.push(winmine.cells[random_int]);
		}
	}
	winmine.backup_mine = (winmine.cells.filter(x => !winmine.mines.includes(x)))[winmine.random(0, ((winmine.height*winmine.width)-winmine.mine_count)-1)]
}

winmine.choose_cell = function(cell_html_id) {
	if(performance.getEntriesByName("game_start").length === 0) {
		performance.mark("game_start");
		winmine.timer_worker = new Worker(URL.createObjectURL(winmine.start_timer_function_blob));
		winmine.timer_worker.onmessage = function(event) {
			winmine.set_timer(event.data);
		}
	}
	const cell_id_string = cell_html_id.substring(5);
	if(winmine.triggered_cells.includes(cell_id_string)) {
		return;
	}
	const cell_element = document.getElementById(cell_html_id);

	/* 1. if cell is a mine and more than one cell has been triggered (not first click), game over */
	if(winmine.mines.includes(cell_id_string)) {
		if(winmine.triggered_cells.length > 1) {
			winmine.timer_worker.terminate();
			winmine.game_over = true;
			winmine.game_win = false;
			cell_element.classList.add('triggered-cell','triggered-mine-cell');
			const smiley_frame = document.getElementsByClassName('smiley-container')[0];
			smiley_frame.classList.remove('face-neutral');
			smiley_frame.classList.add('face-game-over');
			for (let i = 0; i < winmine.mines.length; i += 1) {
				if(!winmine.flagged_cells.includes(winmine.mines[i])) {
					const mine_cell = document.getElementById('cell_' + winmine.mines[i])
					mine_cell.classList.remove('marked-cell');
					mine_cell.classList.add('triggered-cell','mine-cell');
				}
			}
			const incorrectly_flagged = winmine.flagged_cells.filter(x => !winmine.mines.includes(x));
			for (let i = 0; i < incorrectly_flagged.length; i += 1) {
				const elem_id = incorrectly_flagged[i];
				const elem = document.getElementById('cell_' + elem_id);
				elem.classList.remove('flagged-cell');
				elem.classList.add('nomine-cell');
			}
			return;
		} else {
			winmine.mines = winmine.mines.filter(x => x !== cell_id_string);
			winmine.mines.push(winmine.backup_mine);
		}
	}

	/* 2. if cell is a neighbor of a mine, trigger cell with 1-8 integer  */
	winmine.triggered_cells.push(cell_id_string);
	cell_element.classList.add('triggered-cell');
	const neighboring_cells = winmine.get_array_of_neighbor_cells(cell_id_string);
	const neighboring_mines = winmine.get_array_of_neighboring_mines(neighboring_cells);
	if(neighboring_mines.length > 0) {
		cell_element.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines.length,'.svg)'));
	}

	/* 3. if cell is not a mine or a neighbor, do a recursive for search */
	if(neighboring_mines.length === 0) {
		cell_element.classList.add('triggered-cell');
		let search_elements_array = neighboring_cells;
		for (let c = 0; c < search_elements_array.length; c += 1) {
			const cell_id_string2 = search_elements_array[c];
			const cell_element2 = document.getElementById('cell_'+cell_id_string2);
			const neighboring_cells2 = winmine.get_array_of_neighbor_cells(cell_id_string2);
			const neighboring_mines2 = winmine.get_array_of_neighboring_mines(neighboring_cells2);
			/* skip evaluating right-clicked cells */
			if(winmine.flagged_cells.includes(cell_id_string2) || winmine.marked_cells.includes(cell_id_string2)) {
				continue;
			}
			winmine.triggered_cells.push(cell_id_string2);
			cell_element2.classList.add('triggered-cell');
			if(neighboring_mines2.length > 0) {
				cell_element2.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines2.length,'.svg)'));
			} else {
				for (let n = 0; n < neighboring_cells2.length; n += 1) {
					if(!search_elements_array.includes(neighboring_cells2[n])) {
						search_elements_array.push(neighboring_cells2[n])
					}
				}
			}
			if(search_elements_array.length > 1600) {
				alert("too many cells");
				return;
			}
		}
	}

	/* 4. consider win */
	if(winmine.triggered_cells.length === (winmine.height*winmine.width-winmine.mine_count)) {
		performance.mark("game_end");
		performance.measure("m", "game_start", "game_end");
		winmine.game_duration = performance.getEntriesByName('m').duration / 1000;
		winmine.timer_worker.terminate();
		winmine.game_over = true;
		winmine.game_win = true;
		const smiley_frame = document.getElementsByClassName('smiley-container')[0];
		smiley_frame.classList.remove('face-neutral');
		smiley_frame.classList.add('face-game-win');
		// flag every mine
		const unflagged_mines = winmine.mines.filter(x => !winmine.flagged_cells.includes(x));
		for (let i = 0; i < unflagged_mines.length; i += 1) {
			const elem_id = unflagged_mines[i];
			const elem = document.getElementById('cell_' + elem_id);
			elem.classList.add('flagged-cell');
		}
		winmine.set_mine_counter(0);
		return;
	}
	
}

winmine.flag_cell = function(cell_html_id) {
	const cell_id_string = cell_html_id.substring(5);
	const cell_element = document.getElementById(cell_html_id);
	const is_flagged = cell_element.classList.contains('flagged-cell');
	const is_marked = cell_element.classList.contains('marked-cell');
	if(!is_flagged && !is_marked) {
		cell_element.classList.add('flagged-cell');
		winmine.flagged_cells.push(cell_id_string);
	} else if(is_flagged) {
		cell_element.classList.remove('flagged-cell');
		winmine.flagged_cells = winmine.flagged_cells.filter(item => item !== cell_id_string);
		cell_element.classList.add('marked-cell');
		winmine.marked_cells.push(cell_id_string);
	} else if(is_marked) {
		cell_element.classList.remove('marked-cell');
		winmine.marked_cells = winmine.marked_cells.filter(item => item !== cell_id_string);
	}
	winmine.set_mine_counter(winmine.mine_count - winmine.flagged_cells.length);
}

/* create all the javascript event listeners */
document.addEventListener("DOMContentLoaded", function() {
	//winmine.mouse_is_down = false;
	winmine.game_over = false;
	winmine.load_config();
	winmine.fill_cell_container(winmine.height, winmine.width);
	winmine.insert_seven_segment_elements();
	winmine.init_counter(winmine.mine_count);
	winmine.init_timer();
	winmine.set_file_menu_item_marks();

	/* file menu container events are at the file menu item level */
	const menu_items = document.querySelectorAll('.menu-item');
	for (let i = 0; i < menu_items.length; i += 1) {
		const menu_item = menu_items[i];
		menu_item.addEventListener('mouseup', e => {
			const item_text = menu_item.getAttribute('data-name');
			if(item_text === "New") {
				location.reload();
				return;
			}
			if(item_text === 'Beginner') {
				const new_window_salt = winmine.random(100000,999999);
				window.open('?height=8&width=8&mines=10', 'Beginner' + '_' + new_window_salt, 'width=148,height=211');
				return;
			}
			if(item_text === 'Intermediate') {
				const new_window_salt = winmine.random(100000,999999);
				window.open('?height=16&width=16&mines=40', 'Intermediate' + '_' + new_window_salt, 'width=276,height=339');
				return;
			}
			if(item_text === 'Expert') {
				const new_window_salt = winmine.random(100000,999999);
				window.open('?height=16&width=30&mines=99', 'Expert' + '_' + new_window_salt, 'width=500,height=339');
				return;
			}
			if(item_text === 'Exit') {
				window.close();
				return;
			}
		});
	}

	/* prevent right click on everything below file menu */
	document.querySelector(".game-window-frame").addEventListener("contextmenu", function(event) {
		event.preventDefault();
	});

	/* gameplay cell events are delegated by the cell-container */
	document.querySelector(".cell-container").addEventListener("mouseover", function(event) {
		if(winmine.game_over === true) { return; }
		if(event.target.classList.contains('flagged-cell')) { return; }
		if(event.target.classList.contains('marked-cell')) { return; }
		if(winmine.mouse_is_down === true) {
			event.target.classList.add('active-cell');
		}
	});
	document.querySelector(".cell-container").addEventListener("mouseout", function(event) {
		if(winmine.game_over === true) { return; }
		if(event.target.classList.contains('flagged-cell')) { return; }
		if(event.target.classList.contains('marked-cell')) { return; }
		event.target.classList.remove('active-cell');
	});
	document.querySelector(".cell-container").addEventListener("mousedown", function(event) {
		if(winmine.game_over === true) { return; }
		if(event.button === 2) { 
			if(event.target.classList.contains('triggered-cell')) { return; }
			winmine.flag_cell(event.target.id);
			return;
		}
		winmine.mouse_is_down = true;
		if(event.target.classList.contains('flagged-cell')) { return; }
		if(event.target.classList.contains('marked-cell')) { return; }
		if(!event.target.classList.contains('triggered-cell')) {
			event.target.classList.add('active-cell');
		}
	});
	document.querySelector(".cell-container").addEventListener("mouseup", function(event) {
		if(winmine.game_over === true) { return; }
		if(event.button === 2) { return; }
		if(event.target.classList.contains('flagged-cell')) { return; }
		if(event.target.classList.contains('marked-cell')) { return; }
		//winmine.mouse_is_down = false;
		event.target.classList.remove('active-cell');
		winmine.choose_cell(event.target.id);
	});

	 /* game smiley event behavior */
	const smiley_frame = document.getElementsByClassName('smiley-container')[0];
	smiley_frame.addEventListener("mousedown", function(e) {
		smiley_frame.classList.add('smiley-container-mousedown');
		smiley_frame.classList.add('face-neutral');
		winmine.mouse_is_down_smiley = true;
	});
	smiley_frame.addEventListener("mouseup", function(e) {
		if(winmine.mouse_is_down_smiley === true) {
			location.reload();
		}
	});
	smiley_frame.addEventListener('mouseover', function(e) {
		if(winmine.mouse_is_down_smiley === true) {
			smiley_frame.classList.add('smiley-container-mousedown');
			smiley_frame.classList.add('face-neutral');
		}
	});
	smiley_frame.addEventListener("mouseout", function(e) {
		smiley_frame.classList.remove('smiley-container-mousedown');
		smiley_frame.classList.remove('face-neutral');
		if(smiley_frame.classList.contains('face-cursor-down')) {
			return;
		}
		if(winmine.game_over === true) {
			if(winmine.game_win === true) {
				smiley_frame.classList.add('face-game-win');
			} else {
				smiley_frame.classList.add('face-game-over');
			}
		} else {
			smiley_frame.classList.add('face-neutral');
		}
	});

	/* prevent broswer from displaying the "not allowable" cursor (used when click dragging cursor because elements are moveable in html) */
/* 	document.body.addEventListener('mousedown', e => {
		e.preventDefault();
	}); */
	document.body.addEventListener('mousedown', function(e) {
		if(e.button === 2) { return; }
		if(winmine.game_over === false && !e.target.classList.contains('smiley-container')) {
			smiley_frame.classList.remove('face-neutral');
			smiley_frame.classList.add('face-cursor-down');
		}
	});
	/* winmine.exe would remember your mouse button was down even if you left the window, as long as it stayed in focus. not sure this is possible in browser */
	document.body.addEventListener('mouseleave', function(e) {
		if(e.button === 2) { return; }
		winmine.mouse_is_down = false;
	});
	document.body.addEventListener("mouseup", function(e) {
		if(e.button === 2) { return; }
		winmine.mouse_is_down = false;
		winmine.mouse_is_down_smiley = false;
		if(winmine.game_over === false) {
			smiley_frame.classList.remove('face-cursor-down');
			smiley_frame.classList.add('face-neutral');
		}
	});
});