import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const D3Pianoroll = ({ haps = [], time = 0, drawTime = [-2, 2], height = 300 }) => {
  const svgRef = useRef(null);
  const allNotesRef = useRef([]);
  const lastUpdateRef = useRef(0);

  const normalize = (hap) => {
    // Handle both object and array formats from Strudel
    let start, dur, pitch, vel;

    if (typeof hap === 'object' && hap !== null) {
      // Try different property names that Strudel might use
      start = hap.whole?.begin ?? hap.part?.begin ?? hap.t ?? hap.time ?? hap.start ?? hap.begin ?? 0;
      dur = hap.whole?.end ? (hap.whole.end - start) : (hap.d ?? hap.dur ?? hap.length ?? hap.duration ?? 0.25);
      
      // Extract pitch from value object
      const value = hap.value ?? hap;
      pitch = value.note ?? value.n ?? value.pitch ?? value.midi ?? value.p ?? 60;
      vel = value.velocity ?? value.vel ?? value.gain ?? value.v ?? 1;
    } else {
      // Fallback
      start = 0;
      dur = 0.25;
      pitch = 60;
      vel = 1;
    }

    return { 
      start: parseFloat(start) || 0, 
      dur: parseFloat(dur) || 0.25, 
      pitch: parseFloat(pitch) || 60, 
      vel: parseFloat(vel) || 1,
      originalHap: hap
    };
  };

  useEffect(() => {
    // Only update if we have new haps or time has advanced significantly
    const timeDiff = Math.abs(time - lastUpdateRef.current);
    if (haps.length === 0 && allNotesRef.current.length === 0) return;
    if (timeDiff < 0.01 && haps.length === 0) return; // Don't update too frequently
    
    lastUpdateRef.current = time;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;

    // Process incoming haps
    const newNotes = haps
      .map(normalize)
      .filter(n => n.pitch > 0 && n.pitch < 128 && !isNaN(n.pitch));
    
    // Add new notes to collection with better duplicate detection
    newNotes.forEach(note => {
      const noteKey = `${note.start.toFixed(4)}_${note.pitch.toFixed(0)}_${note.dur.toFixed(4)}`;
      const exists = allNotesRef.current.some(existing => {
        const existingKey = `${existing.start.toFixed(4)}_${existing.pitch.toFixed(0)}_${existing.dur.toFixed(4)}`;
        return existingKey === noteKey;
      });
      
      if (!exists) {
        allNotesRef.current.push({ ...note, id: noteKey });
      }
    });

    // Keep only notes within reasonable history window
    const maxHistory = 20; // seconds
    allNotesRef.current = allNotesRef.current.filter(
      note => note.start > time - maxHistory && note.start < time + 10
    );

    const notes = allNotesRef.current;

    // Show wider time window based on drawTime prop
    const timeRange = drawTime[1] - drawTime[0];
    const t0 = time + drawTime[0];
    const t1 = time + drawTime[1];

    const pitches = notes.map(n => n.pitch).filter(p => !isNaN(p));
    const pitchMin = pitches.length > 0 ? Math.min(21, ...pitches) : 48;
    const pitchMax = pitches.length > 0 ? Math.max(108, ...pitches) : 72;

    const margin = { top: 10, right: 10, bottom: 20, left: 50 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([t0, t1]).range([0, w]);
    const y = d3
      .scaleLinear()
      .domain([pitchMin - 2, pitchMax + 2])
      .range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add background grid
    const pitchRange = d3.range(Math.floor(pitchMin), Math.ceil(pitchMax) + 1, 12);
    g.append("g")
      .selectAll("line.grid")
      .data(pitchRange)
      .join("line")
      .attr("class", "grid")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "rgba(100,100,100,0.15)")
      .attr("stroke-width", 1);

    const visible = notes.filter(
      n => n.start + n.dur >= t0 && n.start <= t1
    );

    // Color notes based on timing relative to playhead
    const getNoteColor = (note) => {
      const noteEnd = note.start + note.dur;
      const tolerance = 0.1; // Small tolerance for "currently playing"
      
      if (time >= note.start - tolerance && time <= noteEnd + tolerance) {
        // Currently playing - bright green
        return { 
          fill: "rgba(100,255,100,0.7)", 
          stroke: "rgba(100,255,100,1)",
          strokeWidth: 2
        };
      } else if (time > noteEnd) {
        // Already played - dimmed blue
        return { 
          fill: "rgba(80,150,220,0.3)", 
          stroke: "rgba(80,150,220,0.6)",
          strokeWidth: 1
        };
      } else {
        // Future note - bright blue
        return { 
          fill: "rgba(100,200,255,0.5)", 
          stroke: "rgba(100,200,255,0.9)",
          strokeWidth: 1
        };
      }
    };

    // Draw notes
    g.append("g")
      .selectAll("rect.note")
      .data(visible)
      .join("rect")
      .attr("class", "note")
      .attr("x", d => x(Math.max(d.start, t0)))
      .attr("y", d => y(d.pitch + 0.4))
      .attr("width", d => {
        const noteStart = Math.max(d.start, t0);
        const noteEnd = Math.min(d.start + d.dur, t1);
        return Math.max(2, x(noteEnd) - x(noteStart));
      })
      .attr("height", d => Math.abs(y(d.pitch - 0.4) - y(d.pitch + 0.4)))
      .attr("rx", 2)
      .attr("fill", d => getNoteColor(d).fill)
      .attr("stroke", d => getNoteColor(d).stroke)
      .attr("stroke-width", d => getNoteColor(d).strokeWidth);

    // Add Y-axis with piano key labels
    const yAxis = d3.axisLeft(y)
      .tickValues(pitchRange)
      .tickFormat(d => {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor((d - 12) / 12);
        const note = noteNames[Math.round(d) % 12];
        return `${note}${octave}`;
      });

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "rgba(200,200,200,0.9)")
      .attr("font-size", 10)
      .attr("font-family", "monospace");

    g.selectAll(".y-axis line")
      .attr("stroke", "rgba(200,200,200,0.3)");

    g.selectAll(".y-axis path")
      .attr("stroke", "rgba(200,200,200,0.5)");

    // Add time axis at bottom
    const xAxis = d3.axisBottom(x)
      .ticks(6)
      .tickFormat(d => d.toFixed(1) + "s");

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${h})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "rgba(200,200,200,0.7)")
      .attr("font-size", 9);

    g.selectAll(".x-axis line")
      .attr("stroke", "rgba(200,200,200,0.3)");

    g.selectAll(".x-axis path")
      .attr("stroke", "rgba(200,200,200,0.5)");

    // Draw playhead line (now in front of notes)
    g.append("line")
      .attr("class", "playhead")
      .attr("x1", x(time))
      .attr("x2", x(time))
      .attr("y1", -5)
      .attr("y2", h + 5)
      .attr("stroke", "rgba(255,80,80,0.95)")
      .attr("stroke-width", 2)
      .style("pointer-events", "none");

    // Time label on playhead
    g.append("rect")
      .attr("x", x(time) - 30)
      .attr("y", -5)
      .attr("width", 60)
      .attr("height", 18)
      .attr("fill", "rgba(255,80,80,0.9)")
      .attr("rx", 3);

    g.append("text")
      .attr("x", x(time))
      .attr("y", 8)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("font-family", "monospace")
      .text(time.toFixed(2) + "s");

    // Stats in top right
    g.append("text")
      .attr("x", w - 10)
      .attr("y", 12)
      .attr("text-anchor", "end")
      .attr("fill", "rgba(200,200,200,0.8)")
      .attr("font-size", 10)
      .attr("font-family", "monospace")
      .text(`${visible.length} visible / ${notes.length} total`);

  }, [haps, time, drawTime, height]);

  return (
    <div style={{ width: "100%", height, backgroundColor: "rgba(15,15,30,0.5)", borderRadius: "8px" }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default D3Pianoroll;