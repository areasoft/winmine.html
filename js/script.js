/* Created by Anthony Fucci (thefucci@_@gmail.com) */
/* (GPL-3.0) */

var winmine = {};
winmine.height = 8;
winmine.width = 8;
winmine.mine_count = 10;

winmine.load_config = function() {
	const url_parameters = new URLSearchParams(window.location.search);
	if(url_parameters.has('height') && url_parameters.has('width') && url_parameters.has('mines')) {
		winmine.height = url_parameters.get('height');
		winmine.width = url_parameters.get('width');
		winmine.mine_count = url_parameters.get('mines');
	}
}

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

winmine.sevseg = {};
winmine.fill_seven_segment_container = function(seven_container_html_id) {
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
		/* cell_div.id = 'px' + i; */
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
		winmine.fill_seven_segment_container(seven_elements[i]);
	}
}

winmine.set_mine_counter = function(remaining_mines) {
	remaining_mines = remaining_mines.toString();
	if(remaining_mines.charAt(0) === '-') {
		remaining_mines = '-'.concat(remaining_mines.substring(1).padStart(2, 0));
	} else {
		remaining_mines = remaining_mines.padStart(3, 0);
	}
	document.querySelectorAll('#counter0 > div, #counter1 > div, #counter2 > div').forEach(function (element) {
		element.classList.remove('the-red');
	});
	for(let i = 0; i < 3; i += 1) {
		const anumber = remaining_mines.charAt(i);
		const segment_array = winmine.sevseg.get_segment_array(anumber);
		const counter_id = 'counter'+i;
		const css_selector = '#' + counter_id + ' > .' + segment_array.join('7, #' + counter_id + ' > .').concat('7');
		document.querySelectorAll(css_selector).forEach(function (element) {
			element.classList.add('the-red');
		});
	}
}

winmine.counter_value = [];
winmine.set_mine_counter2 = function(remaining_mines) {
	remaining_mines = remaining_mines.toString();
	if(remaining_mines.charAt(0) === '-') {
		remaining_mines = '-'.concat(remaining_mines.substring(1).padStart(2, 0));
	} else {
		remaining_mines = remaining_mines.padStart(3, 0);
	}
	//if(remaining_mines.charAt() != )
	document.querySelectorAll('#counter0 > div, #counter1 > div, #counter2 > div').forEach(function (element) {
		element.classList.remove('the-red');
	});
	for(let i = 0; i < 3; i += 1) {
		const anumber = remaining_mines.charAt(i);
		const segment_array = winmine.sevseg.get_segment_array(anumber);
		const counter_id = 'counter'+i;
		const css_selector = '#' + counter_id + ' > .' + segment_array.join('7, #' + counter_id + ' > .').concat('7');
		document.querySelectorAll(css_selector).forEach(function (element) {
			element.classList.add('the-red');
		});
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
}

winmine.choose_cell = function(cell_html_id) {
	const cell_id_string = cell_html_id.substring(5);
	const cell_element = document.getElementById(cell_html_id);
	/* 1. if cell is a mine, game over */
	if(winmine.mines.includes(cell_id_string)) {
		cell_element.classList.add('triggered-cell','triggered-mine-cell');
		for (let i = 0; i < winmine.mines.length; i += 1) {
			if(!winmine.flagged_cells.includes(winmine.mines[i])) {
				const mine_cell = document.getElementById('cell_'.concat(winmine.mines[i]))
				mine_cell.classList.remove('marked-cell');
				mine_cell.classList.add('triggered-cell','mine-cell');
			}
			winmine.game_over = true;
		}
		return;
	}
	// check for win how? compare length everytime if flagged mine length mine count?
	// compare length of triggered cells wth mine count?
	/* 2. if winmine.triggered_cells.length = ((height*width)) - winmine.mine_count) */
	/* 3. if cell is a neighbor of a mine, trigger cell with 1-8 integer  */
	const neighboring_cells = winmine.get_array_of_neighbor_cells(cell_id_string);
	const neighboring_mines = winmine.get_array_of_neighboring_mines(neighboring_cells);
	if(neighboring_mines.length > 0) {
		cell_element.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines.length,'.svg)'));
		cell_element.classList.add('triggered-cell');
		winmine.triggered_cells.push(cell_id_string);
		return;
	}
	/* 4. if cell is not a mine or a neighbor, do a recursive for search */
	if(neighboring_mines.length === 0) {
		winmine.triggered_cells.push(cell_id_string);
		cell_element.classList.add('triggered-cell');
		let search_elements_array = neighboring_cells;
		for (let c = 0; c < search_elements_array.length; c += 1) {
			const cell_id_string2 = search_elements_array[c];
			const cell_element2 = document.getElementById('cell_'.concat(cell_id_string2));
			const neighboring_cells2 = winmine.get_array_of_neighbor_cells(cell_id_string2);
			const neighboring_mines2 = winmine.get_array_of_neighboring_mines(neighboring_cells2);
			/* skip evaluating right-clicked cells */
			if(winmine.flagged_cells.includes(cell_id_string2) || winmine.marked_cells.includes(cell_id_string2)) {
				continue;
			}
			if(neighboring_mines2.length > 0) {
				cell_element2.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines2.length,'.svg)'));
				cell_element2.classList.add('triggered-cell');
			} else {
				cell_element2.classList.add('triggered-cell');
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
	winmine.mouse_is_down = false;
	winmine.game_over = false;
	winmine.load_config();
	winmine.fill_cell_container(winmine.height, winmine.width);
	winmine.insert_seven_segment_elements();
	winmine.set_mine_counter(winmine.mine_count);

	/* file menu container events are at the file menu item level */
	const menu_items = document.querySelectorAll('.menu-game-container > div');
	for (let i = 0; i < menu_items.length; i += 1) {
		const menu_item = menu_items[i];
		menu_item.addEventListener('mouseup', e => {
			const item_text = menu_item.innerHTML;
			if(item_text === "New") {
				location.reload();
				return;
			}
			if(item_text === "Beginner") {
				const new_window_salt = winmine.random(100000,999999);
				window.open('index.html?height=8&width=8&mines=10', 'Beginner' + '_' + new_window_salt, 'width=148,height=211');
				return;
			}
			if(item_text === "Intermediate") {
				const new_window_salt = winmine.random(100000,999999);
				window.open('index.html?height=16&width=16&mines=40', 'Intermediate' + '_' + new_window_salt, 'width=276,height=339');
				return;
			}
			if(item_text === "Expert") {
				const new_window_salt = winmine.random(100000,999999);
				window.open('index.html?height=16&width=30&mines=99', 'Expert' + '_' + new_window_salt, 'width=500,height=339');
				return;
			}
		});
	}

	/* gameplay container events are at the grid cell level */
	const wm_cells = document.querySelectorAll('.cell-container > div');
	for (let i = 0; i < wm_cells.length; i += 1) {
		const wm_cell = wm_cells[i];
		/* use mousedown with mouseover to imitate drag-around effect */
		wm_cell.addEventListener('mousedown', e => {
			if(winmine.game_over === true) { return; }
			if(e.button === 2) { 
				if(wm_cell.classList.contains('triggered-cell')) { return; }
				winmine.flag_cell(wm_cell.id);
				return;
			}
			winmine.mouse_is_down = true;
			if(wm_cell.classList.contains('flagged-cell')) { return; }
			if(wm_cell.classList.contains('marked-cell')) { return; }
			if(!wm_cell.classList.contains('triggered-cell')) {
				wm_cell.classList.add('active-cell');
			}
		});
		wm_cell.addEventListener('mouseup', e => {
			if(winmine.game_over === true) { return; }
			if(e.button === 2) { return; }
			if(wm_cell.classList.contains('flagged-cell')) { return; }
			if(wm_cell.classList.contains('marked-cell')) { return; }
			winmine.mouse_is_down = false;
			wm_cell.classList.remove('active-cell');
			winmine.choose_cell(wm_cell.id);
		});
		wm_cell.addEventListener('mouseover', e => {
			if(winmine.game_over === true) { return; }
			if(wm_cell.classList.contains('flagged-cell')) { return; }
			if(wm_cell.classList.contains('marked-cell')) { return; }
			if(winmine.mouse_is_down === true) {
				wm_cell.classList.add('active-cell');
			}
		});
		wm_cell.addEventListener('mouseout', e => {
			if(winmine.game_over === true) { return; }
			if(wm_cell.classList.contains('flagged-cell')) { return; }
			if(wm_cell.classList.contains('marked-cell')) { return; }
			wm_cell.classList.remove('active-cell');
		});
		wm_cell.addEventListener("contextmenu", function(e) {
			e.preventDefault();
/* 			if(winmine.game_over === true) { return; }
			if(wm_cell.classList.contains('triggered-cell')) { return; }
			winmine.flag_cell(wm_cell.id); */
		});
 	}

	/* prevent broswer from displaying the "not allowable" cursor (used when click dragging cursor because elements are moveable in html) */
	document.body.addEventListener('mousedown', e => {
		e.preventDefault();
	});
	/* winmine.exe would remember your mouse button was down even if you left the window, as long as it stayed in focus. not sure this is possible in browser */
	document.body.addEventListener('mouseleave', e => {
		winmine.mouse_is_down = false;
	});	
});