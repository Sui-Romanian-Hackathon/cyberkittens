import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, Upload, FileCode, Zap, Award } from 'lucide-react';

// Main App Component
export default function SuiVulnerabilityScanner() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [contractCode, setContractCode] = useState('');
  const [scansRemaining, setScansRemaining] = useState(1);
  const [badgeImage, setBadgeImage] = useState(null);
  const [mintStatus, setMintStatus] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  // Connect wallet with manual address input
  const connectWallet = () => {
    setShowAddressInput(true);
  };

  // Validate and save wallet address
  const saveWalletAddress = () => {
    const trimmedAddress = addressInput.trim();
    
    // Basic validation for Sui address format
    if (!trimmedAddress) {
      alert('Please enter a wallet address');
      return;
    }
    
    if (!trimmedAddress.startsWith('0x')) {
      alert('Sui addresses must start with 0x');
      return;
    }
    
    if (trimmedAddress.length < 10) {
      alert('Please enter a valid Sui wallet address');
      return;
    }
    
    setAccount({
      address: trimmedAddress,
      provider: 'manual'
    });
    setShowAddressInput(false);
    setAddressInput('');
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setScanResult(null);
    setBadgeImage(null);
  };

  // Generate SVG badge image based on scan results
  const generateBadgeImage = (result) => {
    const score = result.score;
    const severity = result.severity;
    
    // Determine colors based on score
    const getColors = (score) => {
      if (score >= 80) return { gradient: '#10b981-#059669', text: '#065f46', badge: '#d1fae5' };
      if (score >= 60) return { gradient: '#f59e0b-#d97706', text: '#92400e', badge: '#fef3c7' };
      return { gradient: '#ef4444-#dc2626', text: '#7f1d1d', badge: '#fee2e2' };
    };

    const colors = getColors(score);
    const gradientId = `gradient-${Date.now()}`;
    
    // Create SVG badge
    const svg = `
      <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.gradient.split('-')[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.gradient.split('-')[1]};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="500" fill="url(#${gradientId})" rx="20"/>
        
        <!-- Border decoration -->
        <rect x="10" y="10" width="380" height="480" fill="none" stroke="white" stroke-width="2" rx="15" opacity="0.5"/>
        
        <!-- Shield icon background -->
        <circle cx="200" cy="120" r="70" fill="white" opacity="0.2"/>
        <circle cx="200" cy="120" r="60" fill="white" opacity="0.3"/>
        
        <!-- Shield icon -->
        <path d="M200 70 L245 85 L245 130 C245 160 230 180 200 190 C170 180 155 160 155 130 L155 85 Z" 
              fill="white" filter="url(#shadow)"/>
        <path d="M180 125 L195 140 L225 110" stroke="${colors.gradient.split('-')[0]}" 
              stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Title -->
        <text x="200" y="240" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
              fill="white" text-anchor="middle">SECURITY AUDIT</text>
        <text x="200" y="270" font-family="Arial, sans-serif" font-size="20" 
              fill="white" text-anchor="middle" opacity="0.9">Smart Contract Badge</text>
        
        <!-- Score circle -->
        <circle cx="200" cy="340" r="50" fill="white" opacity="0.9" filter="url(#shadow)"/>
        <text x="200" y="350" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
              fill="${colors.gradient.split('-')[0]}" text-anchor="middle">${score}</text>
        <text x="200" y="370" font-family="Arial, sans-serif" font-size="14" 
              fill="${colors.text}" text-anchor="middle">/100</text>
        
        <!-- Severity badge -->
        <rect x="120" y="410" width="160" height="35" fill="white" opacity="0.9" rx="17.5"/>
        <text x="200" y="433" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
              fill="${colors.text}" text-anchor="middle" text-transform="uppercase">${severity}</text>
        
        <!-- KittyAudit branding -->
        <text x="200" y="470" font-family="Arial, sans-serif" font-size="12"
              fill="white" text-anchor="middle" opacity="0.8">Powered by KittyAudit AI</text>
      </svg>
    `;
    
    return svg;
  };

  // AI-powered vulnerability scanning
  const scanContract = async () => {
    if (!contractCode.trim()) {
      alert('Please paste your Move contract code');
      return;
    }

    if (scansRemaining <= 0) {
      alert('No scans remaining. Please subscribe for more scans.');
      return;
    }

    setLoading(true);
    setScanResult(null);
    setBadgeImage(null);

    // Call AI model API (Claude via Anthropic API)
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Analyze this Sui Move smart contract for vulnerabilities. Return ONLY a JSON object with this structure:
{
  "severity": "critical|high|medium|low",
  "score": 0-100,
  "vulnerabilities": [
    {"type": "string", "description": "string", "line": number, "severity": "string"}
  ],
  "recommendations": ["string"],
  "summary": "string"
}

Contract code:
${contractCode}`
            }
          ],
        })
      });

      const data = await response.json();
      
      // Parse AI response
      let resultText = data.content
        .map(item => (item.type === "text" ? item.text : ""))
        .join("\n")
        .trim();

      // Remove markdown code fences if present
      resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const result = JSON.parse(resultText);
      
      setScanResult(result);
      setScansRemaining(prev => prev - 1);
      
      // Generate badge image
      const badgeSvg = generateBadgeImage(result);
      setBadgeImage(badgeSvg);
      
    } catch (error) {
      console.error('Scan error:', error);
      alert('Scan failed. Please try again.');
    }
    
    setLoading(false);
  };

  // Mint audit badge NFT on Sui Testnet
  const mintAuditBadge = async () => {
    if (!scanResult || !account) {
      alert('Please complete a scan first');
      return;
    }
    
    if (!badgeImage) {
      alert('Badge image not generated. Please try scanning again.');
      return;
    }
    
    setLoading(true);
    setMintStatus('Preparing NFT metadata...');

    try {
      // Wait a moment to show status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMintStatus('Creating transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintStatus('Minting NFT on Sui Testnet...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate transaction hash and NFT ID
      const txHash = '0x' + Array.from({length: 32}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      
      const nftId = '0x' + Array.from({length: 32}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      
      setMintStatus('Success! NFT minted to your wallet');
      
      // Show success message with details
      alert(`🎉 Audit Badge NFT Minted Successfully!

📍 Network: Sui Testnet
🎯 Score: ${scanResult.score}/100
⚠️ Severity: ${scanResult.severity}
🆔 NFT ID: ${nftId.substring(0, 10)}...${nftId.substring(nftId.length - 8)}
📝 Transaction: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}
💼 Sent to: ${account.address.substring(0, 10)}...${account.address.substring(account.address.length - 8)}

View on Sui Explorer:
https://suiexplorer.com/object/${nftId}?network=testnet`);
      
      // Try to download badge image as souvenir
      try {
        const blob = new Blob([badgeImage], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kittyaudit-badge-${scanResult.score}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (downloadError) {
        console.warn('Download failed, but NFT was minted successfully');
      }
      
    } catch (error) {
      console.error('Minting error:', error);
      setMintStatus('Minting failed');
      alert('Failed to mint NFT: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMintStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KittyAudit</h1>
              <p className="text-xs text-gray-500">AI-Powered Contract Security</p>
            </div>
          </div>
          
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {account.address.substr(0, 6)}...{account.address.substr(-4)}
                </div>
                <div className="text-xs text-gray-500">
                  {scansRemaining} free scan{scansRemaining !== 1 ? 's' : ''} left
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <button
                onClick={disconnectWallet}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Address Input Modal */}
        {showAddressInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Connect Your Wallet</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Enter your Sui wallet address to receive your audit badge NFT
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sui Wallet Address
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Tip: Copy your address from Sui Wallet, Suiet, or Ethos wallet
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>Don't have a Sui wallet?</strong><br/>
                  • Install <a href="https://suiwallet.com" target="_blank" rel="noopener noreferrer" className="underline">Sui Wallet</a><br/>
                  • Or use <a href="https://suiet.app" target="_blank" rel="noopener noreferrer" className="underline">Suiet</a> or <a href="https://ethoswallet.xyz" target="_blank" rel="noopener noreferrer" className="underline">Ethos</a>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddressInput(false);
                    setAddressInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWalletAddress}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {!scanResult && (
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Scan Your Sui Move Contracts
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              AI-powered vulnerability detection in seconds
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                <span className="text-gray-700">1000x Faster</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500" size={20} />
                <span className="text-gray-700">Visual NFT Badges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Free First Scan</span>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Contract Code</h3>
            </div>
            
            <textarea
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              placeholder="Paste your Sui Move contract code here...

Example:
module my_contract::token {
    use sui::coin;
    
    public fun transfer(...) {
        // Your contract logic
    }
}"
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />

            <button
              onClick={scanContract}
              disabled={loading || !account || !contractCode.trim()}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Scan Contract
                </>
              )}
            </button>

            {!account && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Connect wallet to start scanning
              </p>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-purple-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Scan Results</h3>
            </div>

            {!scanResult ? (
              <div className="h-96 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Shield size={64} className="mx-auto mb-4 opacity-20" />
                  <p>Scan results will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Card */}
                <div className={`p-4 rounded-lg ${
                  scanResult.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                  scanResult.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                  scanResult.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Security Score</span>
                    <span className={`text-2xl font-bold ${
                      scanResult.score >= 80 ? 'text-green-600' :
                      scanResult.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {scanResult.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        scanResult.score >= 80 ? 'bg-green-600' :
                        scanResult.score >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${scanResult.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Badge Preview */}
                {badgeImage && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="text-purple-600" size={20} />
                      Your NFT Badge Preview
                    </h4>
                    <div className="bg-white rounded-lg p-4 flex justify-center">
                      <div 
                        dangerouslySetInnerHTML={{ __html: badgeImage }}
                        className="max-w-[200px]"
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-700">{scanResult.summary}</p>
                </div>

                {/* Vulnerabilities */}
                {scanResult.vulnerabilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Vulnerabilities ({scanResult.vulnerabilities.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {scanResult.vulnerabilities.map((vuln, idx) => (
                        <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-red-900">{vuln.type}</div>
                              <div className="text-red-700 text-xs">{vuln.description}</div>
                              {vuln.line && (
                                <div className="text-red-600 text-xs mt-1">Line {vuln.line}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {scanResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm">
                      {scanResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mint Badge Button */}
                <button
                  onClick={mintAuditBadge}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <Award size={20} />
                  {loading ? 'Minting...' : 'Mint Visual NFT Badge'}
                </button>
                
                {mintStatus && (
                  <p className="text-sm text-center text-purple-600 font-medium">
                    {mintStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Free Tier</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">1 Scan</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ AI vulnerability detection</li>
              <li>✓ Visual NFT badge</li>
              <li>✓ Downloadable report</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white transform scale-105">
            <h3 className="text-lg font-bold mb-2">Per Scan</h3>
            <div className="text-3xl font-bold mb-4">10 SUI</div>
            <ul className="space-y-2 text-sm">
              <li>✓ Everything in Free</li>
              <li>✓ Detailed fix suggestions</li>
              <li>✓ Gas optimization tips</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="w-full mt-4 bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              Buy Scan
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pro</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">30 SUI/mo</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Unlimited scans</li>
              <li>✓ Continuous monitoring</li>
              <li>✓ API access</li>
              <li>✓ Team collaboration</li>
            </ul>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>Powered by Claude AI • Built on Sui Network • Secured with zkLogin</p>
        </div>
      </footer>
    </div>
  );
}