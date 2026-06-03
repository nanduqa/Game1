export class UI {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.startScreen = document.getElementById('startScreen');
    this.hud = document.getElementById('hud');
    this.panel = document.getElementById('activityPanel');
    this.completion = document.getElementById('completionScreen');
    this.controlsWrap = document.getElementById('activityControls');
    this.actionsWrap = document.getElementById('activityActions');
    this.feedback = document.getElementById('feedback');

    document.getElementById('startButton').addEventListener('click', () => callbacks.onStart());
    document.getElementById('restartButton').addEventListener('click', () => callbacks.onRestart());
  }

  showGame() {
    this.startScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.panel.classList.remove('hidden');
    this.completion.classList.add('hidden');
  }

  showCompletion(score, stars) {
    this.hud.classList.add('hidden');
    this.panel.classList.add('hidden');
    this.completion.classList.remove('hidden');
    document.getElementById('completionScore').textContent = `Final score: ${score}`;
    document.getElementById('completionStars').textContent = `Stars earned: ${stars} / 75`;
  }

  updateHud(level, activityIndex, score) {
    document.getElementById('hudProp').textContent = level.prop;
    document.getElementById('hudConcept').textContent = level.concept;
    document.getElementById('hudActivity').textContent = `${activityIndex + 1} / 5`;
    document.getElementById('hudScore').textContent = `${score}`;
  }

  renderActivity(activity, values, localState) {
    document.getElementById('activityTitle').textContent = activity.title;
    document.getElementById('activityInstruction').textContent = activity.instruction;
    this.feedback.textContent = localState.message || '';
    this.feedback.className = `feedback ${localState.feedbackClass || ''}`;

    this.controlsWrap.innerHTML = '';
    this.actionsWrap.innerHTML = '';

    for (const c of activity.controls || []) {
      const wrapper = document.createElement('div');
      wrapper.className = 'control';
      const decimals = String(c.step).includes('.') ? String(c.step).split('.')[1].length : 0;
      const valueText = Number(values[c.key]).toFixed(decimals);
      wrapper.innerHTML = `<label>${c.label}<span class="value">${valueText}</span></label>`;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = c.min;
      input.max = c.max;
      input.step = c.step;
      input.value = values[c.key];
      input.addEventListener('input', () => this.callbacks.onControlChange(c.key, Number(input.value)));
      wrapper.appendChild(input);
      this.controlsWrap.appendChild(wrapper);
    }

    if (activity.type === 'predict') {
      const choices = document.createElement('div');
      choices.className = 'actions';
      activity.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = `choice-btn ${localState.prediction === idx ? 'selected' : ''}`;
        btn.textContent = opt;
        btn.addEventListener('click', () => this.callbacks.onPredict(idx));
        choices.appendChild(btn);
      });
      this.controlsWrap.appendChild(choices);
    }

    const checkBtn = document.createElement('button');
    checkBtn.className = 'action-btn';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => this.callbacks.onCheck());

    const resetBtn = document.createElement('button');
    resetBtn.className = 'action-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => this.callbacks.onReset());

    const nextBtn = document.createElement('button');
    nextBtn.className = 'action-btn';
    nextBtn.textContent = 'Next Activity';
    nextBtn.disabled = !localState.completed;
    nextBtn.style.opacity = localState.completed ? '1' : '0.45';
    nextBtn.addEventListener('click', () => this.callbacks.onNext());

    this.actionsWrap.append(checkBtn, resetBtn, nextBtn);
  }
}
