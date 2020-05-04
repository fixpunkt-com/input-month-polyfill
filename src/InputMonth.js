import Locales from './Locales';

export default class InputMonth {

  constructor(input, lang = 'en') {
    this.original = input;
    if (Locales[lang] === undefined) throw 'Language not implemented.';
    this.locales = Locales[lang];
    this.createStructures();
    this.bindInputEvents();
  }

  createStructures() {
    this.container = document.createElement('div');
    this.container.classList.add('imp--container');
    this.input = document.createElement('input');
    this.input.classList.add('imp--input');
    this.original.classList.forEach(c => input.classList.add(c));
    const iReadOnly = this.original.getAttribute('readonly');
    if (iReadOnly)
      this.input.setAttribute('readonly', iReadOnly);
    this.input.setAttribute('type', 'text');
    this.input.setAttribute('data-month', '');
    this.input.setAttribute('data-year', '');
    this.input.value = '---------- ----';
    this.monthViewer = document.createElement('div');
    this.monthViewer.style = 'display: none';
    this.monthViewer.classList.add('imp--month--viewer');
    this.drawMonthButtons().map(m => this.monthViewer.appendChild(m));
    this.yearViewer = document.createElement('div');
    this.yearViewer.style = 'display: none';
    this.yearViewer.classList.add('imp--year--viewer');
    this.drawYearButtons(new Date().getFullYear() - 4).map(y => this.yearViewer.appendChild(y));
    this.container.appendChild(this.input);
    this.container.appendChild(this.monthViewer);
    this.container.appendChild(this.yearViewer);
    this.original.style = 'display: none';
    this.original.parentNode.insertBefore(this.container, this.original.nextSibling);
  }

  bindInputEvents() {
    this.input.addEventListener('click', this.onInputClick.bind(this));
    this.input.addEventListener('blur', this.onInputBlur.bind(this));
    this.input.addEventListener('keypress', e => e.preventDefault());
    this.input.addEventListener('keydown', this.onInputKeyDown.bind(this));
    this.input.addEventListener('change', this.onInputChange.bind(this));
  }

  drawMonthButtons() {
    const mB = [];
    Object.keys(this.locales).filter(m => !m.includes('ABBR')).forEach((monthName, i) => {
      const monthButton = document.createElement('button');
      monthButton.classList.add('imp--month--button');
      monthButton.setAttribute('type', 'button');
      monthButton.setAttribute('data-month-name', this.locales[monthName]);
      monthButton.setAttribute('data-month-number', (i + 1));
      monthButton.innerHTML = this.locales[`ABBR_${monthName.substr(0, 3)}`];
      monthButton.addEventListener('click', this.onMonthClick.bind(this));
      mB.push(monthButton);
    });
    return mB;
  }

  drawYearButtons(startYear) {
    const yB = [];
    const prevButton = document.createElement('button');
    prevButton.classList.add('imp--year--button--prev');
    prevButton.setAttribute('type', 'button');
    prevButton.addEventListener('click', (e) => {
      this.isInContainer = true;
      this.yearViewer.textContent = '';
      this.drawYearButtons(startYear - 9).map(y => this.yearViewer.appendChild(y));
      this.showYearViewer();
    });
    prevButton.innerHTML = '&lt;';
    const nextButton = document.createElement('button');
    nextButton.classList.add('imp--year--button--next');
    nextButton.setAttribute('type', 'button');
    nextButton.innerHTML = '&gt;';
    nextButton.addEventListener('click', (e) => {
      this.isInContainer = true;
      this.yearViewer.textContent = '';
      this.drawYearButtons(startYear + 9).map(y => this.yearViewer.appendChild(y));
      this.showYearViewer();
    });
    yB.push(prevButton);
    yB.push(nextButton);
    for (let i = startYear; i < startYear + 9; i++) {
      const yearButton = document.createElement('button');
      yearButton.classList.add('imp--year--button');
      yearButton.setAttribute('type', 'button');
      yearButton.setAttribute('data-year', i);
      yearButton.innerHTML = i;
      yearButton.addEventListener('click', this.onYearClick.bind(this));
      yB.push(yearButton);
    }
    return yB;
  }

  onMonthClick(e) {
    console.log(e)
    const sentence = this.input.value.match(/(.+) (.+)/);
    this.input.value = `${e.target.getAttribute('data-month-name')} ${sentence[2]}`;
    this.input.setAttribute('data-month', e.target.getAttribute('data-month-number'));
    this.input.dispatchEvent(new Event('change'));
    if (e.explicitOriginalTarget === e.target)
      this.showYearViewer();
  }

  onYearClick(e) {
    const sentence = this.input.value.match(/(.+) (.+)/);
    this.input.value = `${sentence[1]} ${e.target.getAttribute('data-year')}`;
    this.input.setAttribute('data-year', e.target.getAttribute('data-year'));
    this.input.dispatchEvent(new Event('change'));
    this.input.dispatchEvent(new Event('blur'));
  }

  onInputClick(e) {
    const sentence = e.target.value.match(/(.+) (.+)/);
    if (e.target.selectionStart <= sentence[1].length) {
      e.target.selectionStart = 0;
      e.target.selectionEnd = sentence[1].length;
      this.monthViewer.style = 'display: block';
      this.yearViewer.style = 'display: none';
    }
    else {
      e.target.selectionStart = sentence[1].length + 1;
      e.target.selectionEnd = e.target.selectionStart + 4;
      this.monthViewer.style = 'display: none';
      this.yearViewer.style = 'display: block';
    }
  }

  onInputChange(e) {
    const month = e.target.getAttribute('data-month');
    const year = e.target.getAttribute('data-year');
    if (month !== '' && year !== '')
      this.original.value = `${year}-${month.toString().padStart(2, '0')}`;
    else
      this.original.value = '';
  }

  onInputBlur() {
    setTimeout(() => {
      if (!this.isInContainer) {
        this.monthViewer.style = 'display: none';
        this.yearViewer.style = 'display: none';
      }
      this.isInContainer = false;
    }, 150);
  }

  onInputKeyDown(e) {
    e.preventDefault();
    this.onInputBlur();
    if (this.input.selectionStart === 0)
      this.keyboardMonthSelect(e.keyCode);
    else
      this.keyboardYearSelect(e.keyCode);
  }

  keyboardMonthSelect(code) {
    const cMonth = this.input.getAttribute('data-month');
    switch (code) {
      case 38: // up
        if (cMonth === '' || cMonth === '12')
          this.monthViewer.childNodes[0].click();
        else
          this.monthViewer.childNodes[cMonth].click();
        this.selectInputMonth();
        break;
      case 39: // right
        this.selectInputYear();
        break;
      case 40: // down
        if (cMonth === '' || cMonth === '1')
          this.monthViewer.childNodes[11].click();
        else
          this.monthViewer.childNodes[parseInt(cMonth) - 2].click();
        this.selectInputMonth();
        break;
    }
  }

  selectInputMonth() {
    const sentence = this.input.value.match(/(.+) (.+)/);
    this.input.selectionStart = 0;
    this.input.selectionEnd = sentence[1].length;
  }

  selectInputYear() {
    this.input.selectionStart = this.input.value.length - 4;
    this.input.selectionEnd = this.input.value.length;
  }

  keyboardYearSelect(code) {
    const sentence = this.input.value.match(/(.+) (.+)/);
    const cYear = this.input.getAttribute('data-year');
    switch (code) {
      case 37: // left
        this.selectInputMonth();
        break;
      case 38: // up
        if (cYear === '') {
          this.input.value = `${sentence[1]} ${new Date().getFullYear()}`;
          this.input.setAttribute('data-year', new Date().getFullYear());
        }
        else {
          this.input.value = `${sentence[1]} ${parseInt(cYear) + 1}`;
          this.input.setAttribute('data-year', parseInt(cYear) + 1);
        }
        this.selectInputYear();
        break;
      case 40: // down
        if (cYear === '') {
          this.input.value = `${sentence[1]} ${new Date().getFullYear() - 1}`;
          this.input.setAttribute('data-year', new Date().getFullYear() - 1);
        }
        else {
          this.input.value = `${sentence[1]} ${parseInt(cYear) - 1}`;
          this.input.setAttribute('data-year', parseInt(cYear) - 1);
        }
        this.selectInputYear();
        break;
    }
  }

  showYearViewer() {
    setTimeout(() => {
      const sentence = this.input.value.match(/(.+) (.+)/);
      this.input.selectionStart = sentence[1].length + 1;
      this.input.selectionEnd = this.input.selectionStart + 4;
      this.input.dispatchEvent(new Event('click'));
    }, 200);
  }

}