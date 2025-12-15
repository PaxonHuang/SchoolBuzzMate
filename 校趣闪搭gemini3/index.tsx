
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  Printer, 
  MessageSquare, 
  User, 
  Search, 
  Plus, 
  Heart, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  ArrowRight,
  Menu,
  X,
  CreditCard,
  Settings,
  ChevronLeft,
  Send,
  BarChart3,
  Package,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit3
} from 'lucide-react';

// --- Types ---
type Tab = 'home' | 'partner' | 'market' | 'print' | 'chat' | 'profile';
type PartnerType = 'eat' | 'car' | 'study' | 'game';
type OrderStatus = 'pending' | 'paid' | 'completed';

interface Order {
  id: string;
  item: string;
  amount: number;
  status: OrderStatus;
  user: string;
  time: string;
}

// --- Mock Data ---
const PARTNER_POSTS = [
  { id: 1, type: 'eat', title: '西门烤鱼缺2人', time: '12:00 今天', loc: '西门大排档', user: '大四学长', avatar: '😎', current: 2, max: 4 },
  { id: 2, type: 'car', title: '拼车去市中心万达', time: '14:30 周六', loc: '北门校车站', user: '设计系小美', avatar: '👩‍🎨', current: 1, max: 4 },
  { id: 3, type: 'study', title: '图书馆六楼考研占座', time: '07:00 明天', loc: '图书馆', user: '卷王之王', avatar: '📚', current: 3, max: 4 },
  { id: 4, type: 'game', title: '峡谷排位缺辅助', time: '20:00 今晚', loc: '线上', user: '电竞社长', avatar: '🎮', current: 4, max: 5 },
];

const MARKET_ITEMS = [
  { id: 1, title: 'iPad Air 5 (99新)', price: 3200, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80', tag: '数码' },
  { id: 2, title: '高等数学(同济版)', price: 15, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', tag: '书籍' },
  { id: 3, title: '吉他 (送琴包)', price: 200, img: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=300&q=80', tag: '乐器' },
  { id: 4, title: '宜家置物架', price: 45, img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80', tag: '生活' },
];

const MOCK_ORDERS: Order[] = [
    { id: 'ORD-7821', item: '打印服务 (PDF)', amount: 2.5, status: 'completed', user: 'User_992', time: '10:23' },
    { id: 'ORD-7822', item: '二手 - 吉他', amount: 200, status: 'paid', user: 'User_102', time: '09:45' },
    { id: 'ORD-7823', item: '打印服务 (IMG)', amount: 1.0, status: 'pending', user: 'User_554', time: '09:30' },
];

// --- Styles ---
// New Brutalism / Neo-Brutalism Style System
const styles = {
  container: "min-h-screen bg-[#F4F2ED] font-sans text-gray-900 selection:bg-[#FFD027]",
  brutalBorder: "border-2 border-black",
  brutalShadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  brutalShadowSm: "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  brutalCard: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  brutalBtn: "bg-[#FFD027] px-4 py-2 font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#FFDB57] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px]",
  brutalBtnSecondary: "bg-white px-4 py-2 font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all",
  brutalInput: "w-full p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
  tag: "inline-block px-2 py-0.5 text-xs font-bold border border-black bg-white",
  badge: "absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs border-2 border-black px-1.5 py-0.5 font-bold rounded-full",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [notification, setNotification] = useState<string | null>(null);
  
  // New States for enhanced features
  const [checkoutItem, setCheckoutItem] = useState<{title: string, price: number} | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCheckout = (title: string, price: number) => {
    setCheckoutItem({ title, price });
  };

  const renderContent = () => {
    if (activeChatId !== null) {
        return <ChatRoomView chatId={activeChatId} onBack={() => setActiveChatId(null)} />;
    }
    
    if (ordersOpen) {
        return <MyOrdersView onBack={() => setOrdersOpen(false)} />;
    }

    switch (activeTab) {
      case 'home': return <HomeView onChangeTab={setActiveTab} />;
      case 'partner': return <PartnerView onJoin={() => showToast('已发送组队申请！等待队长确认。')} />;
      case 'market': return <MarketView onBuy={handleCheckout} />;
      case 'print': return <PrintView onPrint={() => handleCheckout('云打印服务 (A4黑白 x 5)', 2.5)} />;
      case 'chat': return <ChatListView onSelectChat={setActiveChatId} />;
      case 'profile': return <ProfileView onOpenAdmin={() => setAdminOpen(true)} onOpenOrders={() => setOrdersOpen(true)} />;
      default: return <HomeView onChangeTab={setActiveTab} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Global Texture */}
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Admin Overlay */}
      {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
      
      {/* Checkout Modal Overlay */}
      {checkoutItem && (
        <CheckoutModal 
          item={checkoutItem} 
          onClose={() => setCheckoutItem(null)} 
          onSuccess={() => {
            setCheckoutItem(null);
            showToast('支付成功！订单已生成');
          }} 
        />
      )}

      {/* Publish Modal Overlay */}
      {publishOpen && (
          <PublishModal onClose={() => setPublishOpen(false)} onSuccess={() => {
              setPublishOpen(false);
              showToast('发布成功！');
          }}/>
      )}

      {/* Dynamic Island / Header Area */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-[#F4F2ED]/95 backdrop-blur-sm border-b-2 border-black flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm cursor-pointer">
            X
          </div>
          <h1 className="font-bold text-xl tracking-tighter cursor-pointer">校趣闪搭</h1>
        </div>
        <div className="flex gap-3">
           <button className="p-2 border-2 border-black bg-white hover:bg-gray-50 active:translate-y-1 transition-transform rounded-full">
            <Search size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className="p-2 border-2 border-black bg-[#90E0EF] active:translate-y-1 transition-transform rounded-full relative"
          >
            <MessageSquare size={20} />
            <span className={styles.badge}>3</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24 px-4 pt-4 max-w-md mx-auto min-h-[85vh] relative z-10">
        {renderContent()}
      </main>

      {/* Tab Bar / Dock */}
      {!adminOpen && !ordersOpen && activeChatId === null && !checkoutItem && !publishOpen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black px-4 py-3 pb-6 z-30 safe-area-bottom">
            <div className="max-w-md mx-auto flex justify-between items-end">
            <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="首页" />
            <TabButton active={activeTab === 'partner'} onClick={() => setActiveTab('partner')} icon={Users} label="找搭子" />
            
            {/* Main Action Button - Now Opens Publish Modal */}
            <div className="relative -top-6">
                <button 
                onClick={() => setPublishOpen(true)}
                className={`w-14 h-14 bg-[#FF6B6B] border-2 border-black rounded-full flex items-center justify-center text-white ${styles.brutalShadow} active:translate-y-[2px] active:shadow-none transition-all group`}
                >
                <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <TabButton active={activeTab === 'print'} onClick={() => setActiveTab('print')} icon={Printer} label="云印" />
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="我的" />
            </div>
        </nav>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] w-11/12 max-w-sm animate-bounce-in pointer-events-none">
          <div className="bg-[#1A1A1A] text-white px-6 py-4 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,208,39,1)] flex items-center gap-3">
             <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse"></div>
             <span className="font-bold font-mono">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Enhanced Components ---

const PublishModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
             <div className={`w-full max-w-sm bg-[#F4F2ED] border-2 border-black ${styles.brutalShadow} p-6 relative`}>
                <button onClick={onClose} className="absolute top-4 right-4 hover:bg-black hover:text-white border-2 border-black p-1 transition-colors"><X size={24}/></button>
                
                <h2 className="text-3xl font-black mb-8 text-center italic">What's New?</h2>
                
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={onSuccess} className={`p-6 bg-[#D6A3FB] ${styles.brutalBorder} ${styles.brutalShadowSm} hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-4 group`}>
                         <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                             <Users size={24} />
                         </div>
                         <div className="text-left">
                             <div className="font-black text-lg">找搭子</div>
                             <div className="text-xs font-mono">Team up for food/study</div>
                         </div>
                    </button>

                    <button onClick={onSuccess} className={`p-6 bg-[#97E3B6] ${styles.brutalBorder} ${styles.brutalShadowSm} hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-4 group`}>
                         <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center group-hover:-rotate-12 transition-transform">
                             <Package size={24} />
                         </div>
                         <div className="text-left">
                             <div className="font-black text-lg">发布闲置</div>
                             <div className="text-xs font-mono">Sell your used items</div>
                         </div>
                    </button>
                </div>
             </div>
        </div>
    )
}

const MyOrdersView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="animate-slide-in-right h-full">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"><ChevronLeft size={24}/></button>
                <h2 className="text-2xl font-black">MY ORDERS</h2>
            </div>
            
            <div className="space-y-4">
                {MOCK_ORDERS.map(order => (
                    <div key={order.id} className={`bg-white p-4 border-2 border-black ${styles.brutalShadowSm} relative`}>
                        <div className="flex justify-between items-start mb-2">
                             <span className="font-mono text-xs bg-black text-white px-1">{order.id}</span>
                             <span className={`text-xs font-bold px-2 py-0.5 border border-black ${
                                 order.status === 'completed' ? 'bg-[#97E3B6]' : 
                                 order.status === 'paid' ? 'bg-[#90E0EF]' : 'bg-[#FF6B6B] text-white'
                             }`}>
                                 {order.status.toUpperCase()}
                             </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{order.item}</h3>
                        <div className="flex justify-between items-center text-sm font-mono text-gray-500">
                            <span>{order.time} Today</span>
                            <span className="text-black font-black text-xl">¥{order.amount.toFixed(2)}</span>
                        </div>
                        {order.status === 'pending' && (
                             <button className="w-full mt-3 py-2 bg-[#FFD027] font-bold border-2 border-black text-sm hover:bg-[#ffe066]">
                                 去支付
                             </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const CheckoutModal = ({ item, onClose, onSuccess }: { item: {title: string, price: number}, onClose: () => void, onSuccess: () => void }) => {
    const [loading, setLoading] = useState(false);

    const handlePay = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-sm bg-white border-2 border-black ${styles.brutalShadow} p-6 relative`}>
                <button onClick={onClose} className="absolute top-4 right-4 hover:bg-gray-100 border border-black p-1"><X size={20}/></button>
                
                <h2 className="text-2xl font-black mb-6 border-b-2 border-black pb-2">收银台</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start">
                        <span className="text-gray-500 font-mono">商品内容</span>
                        <span className="font-bold text-right w-1/2">{item.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-mono">应付金额</span>
                        <span className="font-black text-3xl text-[#FF6B6B]">¥{item.price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-3 p-3 border-2 border-black cursor-pointer bg-gray-50">
                        <input type="radio" name="pay" defaultChecked className="w-4 h-4 accent-black" />
                        <span className="font-bold flex-1">微信支付</span>
                        <div className="w-6 h-6 bg-[#09BB07] rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-black cursor-pointer bg-white">
                        <input type="radio" name="pay" className="w-4 h-4 accent-black" />
                        <span className="font-bold flex-1">钱包余额</span>
                        <span className="font-mono text-xs text-gray-500">¥128.00</span>
                    </label>
                </div>

                <button 
                    onClick={handlePay}
                    disabled={loading}
                    className={`w-full py-3 bg-[#FFD027] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2 ${loading ? 'opacity-80' : ''}`}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            处理中...
                        </>
                    ) : '确认支付'}
                </button>
            </div>
        </div>
    )
}

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 bg-[#F4F2ED] overflow-y-auto animate-slide-up">
            <header className="sticky top-0 bg-black text-white p-4 flex justify-between items-center border-b-4 border-[#FFD027] z-20">
                <div className="flex items-center gap-2">
                    <Settings size={24} className="animate-spin-slow" />
                    <h2 className="font-mono text-xl font-bold tracking-wider">ADMIN_PANEL v1.0</h2>
                </div>
                <button onClick={onClose} className="px-4 py-1 border border-white hover:bg-white hover:text-black font-mono text-sm transition-colors">
                    EXIT
                </button>
            </header>

            <div className="p-4 max-w-4xl mx-auto space-y-8 pb-10">
                {/* Stats Row */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AdminStatCard label="Total Users" value="1,204" color="bg-[#90E0EF]" />
                    <AdminStatCard label="Active Orders" value="42" color="bg-[#FF6B6B]" />
                    <AdminStatCard label="Revenue" value="¥8,230" color="bg-[#FFD027]" />
                    <AdminStatCard label="Reports" value="3" color="bg-[#D6A3FB]" />
                </section>

                {/* Charts Area (Simulated) */}
                <section className={`bg-white p-6 border-2 border-black ${styles.brutalShadow}`}>
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2"><BarChart3 size={20}/> Weekly Activity</h3>
                    <div className="h-40 flex items-end justify-between gap-2 px-2 border-b-2 border-black pb-0">
                        {[40, 65, 30, 85, 50, 95, 60].map((h, i) => (
                            <div key={i} className="w-full bg-black hover:bg-[#FFD027] transition-colors relative group" style={{ height: `${h}%` }}>
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">{h}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 font-mono text-xs text-gray-500">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </section>

                {/* Orders Table */}
                <section className={`bg-white border-2 border-black ${styles.brutalShadow}`}>
                    <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                        <h3 className="font-black text-lg flex items-center gap-2"><Package size={20}/> Recent Orders</h3>
                        <button className="text-xs font-bold underline">Export CSV</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-sm">
                            <thead className="bg-[#FFD027] border-b-2 border-black">
                                <tr>
                                    <th className="p-3 border-r-2 border-black">ID</th>
                                    <th className="p-3 border-r-2 border-black">User</th>
                                    <th className="p-3 border-r-2 border-black">Item</th>
                                    <th className="p-3 border-r-2 border-black">Amount</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_ORDERS.map((order, i) => (
                                    <tr key={order.id} className="border-b-2 border-black last:border-0 hover:bg-gray-50">
                                        <td className="p-3 border-r-2 border-black font-bold">{order.id}</td>
                                        <td className="p-3 border-r-2 border-black">{order.user}</td>
                                        <td className="p-3 border-r-2 border-black truncate max-w-[120px]">{order.item}</td>
                                        <td className="p-3 border-r-2 border-black">¥{order.amount}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 border border-black text-xs font-bold ${
                                                order.status === 'completed' ? 'bg-[#97E3B6]' : 
                                                order.status === 'paid' ? 'bg-[#90E0EF]' : 'bg-[#FF6B6B]'
                                            }`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

const AdminStatCard = ({ label, value, color }: any) => (
    <div className={`${color} p-4 border-2 border-black ${styles.brutalShadowSm} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default`}>
        <div className="text-xs font-mono font-bold opacity-70 mb-1">{label.toUpperCase()}</div>
        <div className="text-2xl font-black">{value}</div>
    </div>
);

// --- Sub Components ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'transform -translate-y-1' : 'opacity-60'}`}
  >
    <div className={`p-1 ${active ? 'bg-[#FFD027] border-2 border-black' : ''} rounded-md transition-colors`}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

// --- Views ---

const HomeView = ({ onChangeTab }: { onChangeTab: (t: Tab) => void }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hello Card */}
      <div className={`bg-[#FFD027] p-5 ${styles.brutalBorder} ${styles.brutalShadow} relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
        <div className="absolute bottom-2 right-10 w-16 h-4 bg-black/10 -rotate-3"></div>

        <h2 className="text-3xl font-black mb-2 font-serif italic relative z-10">Hello, <br/>Campus!</h2>
        <p className="font-mono text-sm mb-4 relative z-10">今天也要充满活力！校园里有 <span className="bg-white border border-black px-1 font-bold">128</span> 个新活动。</p>
        <div className="flex gap-2 relative z-10">
           <button onClick={() => onChangeTab('partner')} className="bg-white px-3 py-1 text-sm font-bold border-2 border-black hover:bg-black hover:text-white transition-colors box-shadow-none">#拼车回家</button>
           <button onClick={() => onChangeTab('market')} className="bg-white px-3 py-1 text-sm font-bold border-2 border-black hover:bg-black hover:text-white transition-colors">#二手教材</button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => onChangeTab('partner')} className={`bg-[#D6A3FB] p-4 h-32 flex flex-col justify-between cursor-pointer ${styles.brutalCard} group`}>
           <div className="flex justify-between">
              <Users size={32} className="group-hover:scale-110 transition-transform"/>
              <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform" />
           </div>
           <span className="font-black text-2xl tracking-tighter">找搭子</span>
        </div>
        <div onClick={() => onChangeTab('market')} className={`bg-[#97E3B6] p-4 h-32 flex flex-col justify-between cursor-pointer ${styles.brutalCard} group`}>
           <div className="flex justify-between">
              <ShoppingBag size={32} className="group-hover:scale-110 transition-transform"/>
              <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform" />
           </div>
           <span className="font-black text-2xl tracking-tighter">淘好货</span>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-black text-xl bg-black text-white px-2 -rotate-1 inline-block">HOT TOPICS</h3>
            <span className="font-mono text-xs underline cursor-pointer hover:bg-[#FFD027]">查看更多</span>
        </div>
        {[1,2,3].map(i => (
            <div key={i} className={`bg-white p-4 ${styles.brutalBorder} ${styles.brutalShadowSm} flex gap-4 hover:translate-x-1 transition-transform`}>
                <div className="w-12 h-12 bg-gray-200 border-2 border-black flex-shrink-0 relative">
                    <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=100&q=60`} className="w-full h-full object-cover grayscale" alt=""/>
                </div>
                <div>
                    <h4 className="font-bold text-sm">吉他社今晚路演，不见不散！🎸</h4>
                    <p className="text-xs text-gray-500 font-mono mt-1">@吉他社 • 2小时前</p>
                    <div className="mt-2 flex gap-4 text-xs font-bold font-mono">
                        <span className="flex items-center gap-1"><Heart size={12}/> 24</span>
                        <span className="flex items-center gap-1"><MessageSquare size={12}/> 5</span>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const PartnerView = ({ onJoin }: { onJoin: () => void }) => {
  const [filter, setFilter] = useState<PartnerType | 'all'>('all');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {['all', 'eat', 'car', 'study', 'game'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f as any)}
            className={`whitespace-nowrap px-4 py-2 border-2 border-black font-bold text-sm transition-all ${filter === f ? 'bg-black text-white shadow-[2px_2px_0px_0px_#FFD027]' : 'bg-white text-black hover:bg-gray-100'}`}
          >
            {f === 'all' ? '全部' : f === 'eat' ? '干饭' : f === 'car' ? '拼车' : f === 'study' ? '学习' : '游戏'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {PARTNER_POSTS.filter(p => filter === 'all' || p.type === filter).map((post) => (
          <div key={post.id} className={`bg-white p-0 ${styles.brutalBorder} ${styles.brutalShadow} relative overflow-hidden group`}>
             <div className={`absolute top-0 left-0 w-2 h-full border-r-2 border-black ${
                 post.type === 'eat' ? 'bg-[#FF6B6B]' : 
                 post.type === 'car' ? 'bg-[#FFD027]' : 
                 post.type === 'study' ? 'bg-[#97E3B6]' : 'bg-[#D6A3FB]'
             }`}></div>
             
             <div className="p-4 pl-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs border border-black px-1 bg-gray-100 font-bold">{post.type.toUpperCase()}</span>
                    <span className="font-mono text-xs text-gray-500">{post.time}</span>
                </div>
                <h3 className="font-black text-lg mb-2">{post.title}</h3>
                <div className="flex items-center gap-2 text-sm font-mono mb-4 text-gray-600">
                    <MapPin size={14} /> {post.loc}
                </div>
                
                <div className="flex justify-between items-center border-t-2 border-black pt-3 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            {post.avatar}
                        </div>
                        <span className="text-xs font-bold">{post.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-gray-100 px-2 border border-black">{post.current}/{post.max}</span>
                        <button onClick={onJoin} className={`text-xs px-3 py-1 bg-black text-white font-bold hover:bg-[#FFD027] hover:text-black hover:border-black border-2 border-transparent transition-colors`}>
                            我要上车
                        </button>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketView = ({ onBuy }: { onBuy: (t: string, p: number) => void }) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className={`bg-[#97E3B6] p-4 ${styles.brutalBorder} ${styles.brutalShadow} mb-6 flex justify-between items-center`}>
                <div>
                    <h2 className="text-xl font-black">FLEA MARKET</h2>
                    <p className="font-mono text-xs">二手交易，杜绝中间商</p>
                </div>
                <ShoppingBag size={32} strokeWidth={2.5}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {MARKET_ITEMS.map((item) => (
                    <div key={item.id} className={`bg-white flex flex-col ${styles.brutalBorder} ${styles.brutalShadowSm} hover:shadow-[4px_4px_0px_0px_black] transition-all`}>
                        <div className="h-32 bg-gray-200 border-b-2 border-black relative group overflow-hidden">
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <span className="absolute top-2 left-2 bg-white border border-black text-[10px] px-1 font-bold z-10">{item.tag}</span>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                            <h4 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{item.title}</h4>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-mono font-black text-lg">¥{item.price}</span>
                                <button onClick={() => onBuy(item.title, item.price)} className="w-7 h-7 bg-[#FF6B6B] border-2 border-black flex items-center justify-center active:translate-y-0.5 hover:bg-[#ff4f4f] transition-colors">
                                    <Plus size={16} color="white" strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PrintView = ({ onPrint }: { onPrint: () => void }) => {
    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in">
             <div className="text-center py-6 border-b-2 border-black border-dashed">
                <h2 className="text-3xl font-black mb-1 tracking-widest">CLOUD PRINT</h2>
                <div className="inline-block bg-black text-white px-2 text-xs font-mono">V 2.0.1</div>
             </div>

             <div className={`flex-1 bg-white border-2 border-black p-8 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] ${styles.brutalShadow} relative`}>
                <div className="absolute top-2 left-2 w-3 h-3 border border-black rounded-full"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border border-black rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border border-black rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border border-black rounded-full"></div>

                <div className="w-20 h-20 bg-[#FFD027] border-2 border-black rounded-full flex items-center justify-center mb-2 animate-bounce-slow">
                    <Printer size={40} strokeWidth={2} />
                </div>
                <div className="text-center">
                    <p className="font-black text-lg">点击上传文件</p>
                    <p className="text-xs font-mono text-gray-500 mt-1">PDF, DOCX, JPG (Max 50MB)</p>
                </div>
             </div>

             <div className={`bg-white p-4 ${styles.brutalBorder} space-y-4`}>
                <div className="flex justify-between items-center">
                    <span className="font-bold font-mono">COPIES</span>
                    <div className="flex items-center gap-3 border-2 border-black px-2 py-1 bg-gray-50">
                        <button className="font-bold hover:text-red-500 w-6">-</button>
                        <span className="font-mono w-6 text-center font-bold">1</span>
                        <button className="font-bold hover:text-green-500 w-6">+</button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold font-mono">COLOR</span>
                    <div className="flex gap-2">
                        <button className="border-2 border-black px-2 py-1 text-xs bg-black text-white font-bold">B&W</button>
                        <button className="border-2 border-black px-2 py-1 text-xs hover:bg-gray-100 font-bold text-gray-400">CMYK</button>
                    </div>
                </div>
             </div>

             <button onClick={onPrint} className={`w-full py-4 bg-[#3B82F6] text-white font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none hover:bg-[#2563eb] transition-all`}>
                 UPLOAD & PAY
             </button>
        </div>
    );
};

const ChatListView = ({ onSelectChat }: { onSelectChat: (id: number) => void }) => (
    <div className="space-y-4 animate-fade-in">
        <h2 className="font-black text-xl px-2 border-l-4 border-[#FFD027] ml-1">MESSAGES</h2>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} onClick={() => onSelectChat(i)} className={`bg-white p-4 ${styles.brutalBorder} flex gap-4 items-center cursor-pointer hover:bg-[#f0f0f0] active:scale-[0.99] transition-all`}>
                <div className="w-12 h-12 bg-[#90E0EF] border-2 border-black flex-shrink-0 overflow-hidden relative">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix${i}`} alt="avatar" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">同学_0{i}</span>
                        <span className="text-xs font-mono text-gray-400">12:3{i}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate font-medium">
                        {i === 1 ? '那个iPad还在吗？我想看看成色...' : '好的，那我们在图书馆楼下见。'}
                    </p>
                </div>
                {i === 1 && <div className="w-3 h-3 bg-[#FF6B6B] border border-black rounded-full"></div>}
            </div>
        ))}
    </div>
);

const ChatRoomView = ({ chatId, onBack }: { chatId: number, onBack: () => void }) => {
    const [msgs, setMsgs] = useState([
        { id: 1, text: '你好，请问那个iPad Air还在吗？', isMe: false },
        { id: 2, text: '在的，99新，几乎没怎么用过。', isMe: true },
        { id: 3, text: '可以小刀吗？学生党预算有限🥺', isMe: false },
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMsgs([...msgs, { id: Date.now(), text: input, isMe: true }]);
        setInput('');
        setTimeout(() => {
             setMsgs(prev => [...prev, { id: Date.now()+1, text: '好的，没问题！', isMe: false }]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col -mt-4 -mx-4 h-[calc(100vh-80px)] bg-white animate-slide-in-right">
            {/* Chat Header */}
            <div className="p-4 border-b-2 border-black bg-[#F4F2ED] flex items-center gap-3 sticky top-0 z-10">
                <button onClick={onBack} className="p-1 border-2 border-black bg-white hover:bg-gray-100"><ChevronLeft size={20}/></button>
                <div className="flex-1">
                    <h3 className="font-bold">同学_0{chatId}</h3>
                    <p className="text-xs text-gray-500 font-mono">Online</p>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded"><MoreHorizontal size={20}/></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F2ED]">
                {msgs.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 border-2 border-black text-sm font-bold ${
                            msg.isMe 
                            ? `bg-[#FFD027] rounded-l-lg rounded-tr-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` 
                            : `bg-white rounded-r-lg rounded-tl-lg shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)]`
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t-2 border-black bg-white flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="输入消息..." 
                    className="flex-1 border-2 border-black p-2 focus:outline-none focus:bg-gray-50 font-mono text-sm"
                />
                <button onClick={handleSend} className="bg-black text-white px-4 border-2 border-transparent active:bg-gray-800">
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}

const ProfileView = ({ onOpenAdmin, onOpenOrders }: { onOpenAdmin: () => void, onOpenOrders: () => void }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className={`bg-white p-6 ${styles.brutalBorder} ${styles.brutalShadow} flex flex-col items-center gap-4 relative`}>
                <div className="absolute top-2 right-2 bg-[#90E0EF] text-xs font-bold px-2 py-0.5 border border-black transform rotate-6">PRO</div>
                <div className="w-24 h-24 bg-[#FFD027] rounded-full border-4 border-black overflow-hidden relative">
                     <img src="https://api.dicebear.com/7.x/micah/svg?seed=Felix" alt="Profile" className="w-full h-full" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black">张同学</h2>
                    <p className="font-mono text-sm text-gray-500 bg-gray-100 px-2 inline-block border border-black mt-1">计算机科学与技术 / 大三</p>
                </div>
                <div className="flex gap-4 w-full mt-4">
                     <div className="flex-1 text-center border-r-2 border-black">
                         <div className="font-black text-xl">12</div>
                         <div className="text-xs font-mono font-bold text-gray-500">POSTS</div>
                     </div>
                     <div className="flex-1 text-center border-r-2 border-black">
                         <div className="font-black text-xl">5</div>
                         <div className="text-xs font-mono font-bold text-gray-500">SOLD</div>
                     </div>
                     <div className="flex-1 text-center">
                         <div className="font-black text-xl">¥128</div>
                         <div className="text-xs font-mono font-bold text-gray-500">BALANCE</div>
                     </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MenuButton icon={CreditCard} label="我的钱包" />
                <MenuButton icon={ShoppingBag} label="我的订单" onClick={onOpenOrders} />
                <MenuButton icon={Settings} label="后台管理" color="bg-[#FF6B6B] text-white" onClick={onOpenAdmin} />
                <MenuButton icon={ArrowRight} label="退出登录" />
            </div>

            {/* VIP Banner */}
            <div className="bg-black text-[#FFD027] p-4 border-2 border-black flex justify-between items-center cursor-pointer hover:opacity-90">
                <div>
                    <h3 className="font-black italic text-lg">VIP MEMBER</h3>
                    <p className="text-xs font-mono text-gray-400">Unlock more features</p>
                </div>
                <ArrowRight />
            </div>
        </div>
    );
};

const MenuButton = ({ icon: Icon, label, color = "bg-white", onClick }: any) => (
    <button onClick={onClick} className={`p-4 ${color} ${styles.brutalBorder} ${styles.brutalShadowSm} flex flex-col items-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all`}>
        <Icon size={24} strokeWidth={2.5} />
        <span className="font-bold text-sm">{label}</span>
    </button>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
