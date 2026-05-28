import { useEffect, useRef, useState } from 'react';
import { Download, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) => {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((currentLine, index) => {
    ctx.fillText(currentLine, x, y + index * lineHeight);
  });
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const drawImpactCard = (canvas, impact) => {
  const ctx = canvas.getContext('2d');
  const date = formatDate(impact.collectedDate);

  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, '#f0fdf4');
  bg.addColorStop(0.48, '#ffffff');
  bg.addColorStop(1, '#ecfeff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = '#14532d';
  roundRect(ctx, 70, 70, 940, 1210, 46);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 90, 90, 900, 1170, 38);
  ctx.fill();

  ctx.fillStyle = '#16a34a';
  roundRect(ctx, 130, 130, 150, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px Inter, Arial, sans-serif';
  ctx.fillText('FoodBridge', 157, 168);

  ctx.fillStyle = '#dcfce7';
  roundRect(ctx, 800, 130, 90, 90, 30);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.font = '700 52px Inter, Arial, sans-serif';
  ctx.fillText('FB', 815, 190);

  ctx.fillStyle = '#111827';
  ctx.font = '800 74px Inter, Arial, sans-serif';
  drawWrappedText(ctx, 'Impact Card', 130, 310, 760, 82, 1);

  ctx.fillStyle = '#4b5563';
  ctx.font = '500 34px Inter, Arial, sans-serif';
  drawWrappedText(ctx, `${impact.donorName} helped feed people through surplus food rescue.`, 130, 370, 760, 46, 2);

  ctx.fillStyle = '#f0fdf4';
  roundRect(ctx, 130, 510, 820, 320, 34);
  ctx.fill();

  ctx.fillStyle = '#14532d';
  ctx.font = '800 132px Inter, Arial, sans-serif';
  ctx.fillText(String(impact.mealsServed), 170, 655);

  ctx.fillStyle = '#166534';
  ctx.font = '800 42px Inter, Arial, sans-serif';
  ctx.fillText('meals served', 180, 715);

  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(530, 570);
  ctx.lineTo(530, 770);
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = '800 70px Inter, Arial, sans-serif';
  ctx.fillText(`${impact.co2SavedKg}`, 590, 650);
  ctx.fillStyle = '#047857';
  ctx.font = '700 34px Inter, Arial, sans-serif';
  ctx.fillText('kg CO2 saved', 592, 710);

  ctx.fillStyle = '#111827';
  ctx.font = '800 40px Inter, Arial, sans-serif';
  drawWrappedText(ctx, impact.foodName, 130, 910, 800, 48, 2);

  ctx.fillStyle = '#6b7280';
  ctx.font = '500 30px Inter, Arial, sans-serif';
  ctx.fillText(`Collected by ${impact.ngoName}`, 130, 1020);
  ctx.fillText(date, 130, 1072);

  ctx.fillStyle = '#ecfdf5';
  roundRect(ctx, 130, 1140, 820, 76, 24);
  ctx.fill();
  ctx.fillStyle = '#166534';
  ctx.font = '700 28px Inter, Arial, sans-serif';
  ctx.fillText('Share more food. Waste less. Feed more.', 170, 1188);
};

const ImpactCard = ({ donationId }) => {
  const canvasRef = useRef(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.get(`/donations/${donationId}/impact`);
        setImpact(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load impact card');
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, [donationId]);

  useEffect(() => {
    if (impact && canvasRef.current) {
      drawImpactCard(canvasRef.current, impact);
    }
  }, [impact]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !impact) return;

    const link = document.createElement('a');
    link.download = `foodbridge-impact-${impact._id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWhatsAppShare = () => {
    if (!impact) return;

    const appUrl = window.location.origin;
    const message = `${impact.shareText || `I just saved ${impact.mealsServed} meals from going to waste through FoodBridge! \u{1F331}`} ${appUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Preparing impact card...</div>;
  }

  if (!impact) return null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-800">
        <Sparkles className="h-4 w-4" />
        Donor Impact Card
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-green-100 bg-white shadow-sm"
        aria-label="FoodBridge impact card preview"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          PNG
        </button>
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ImpactCard;
