import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { TotalRequests } from "@/components/TotalRequests";

export default function Health() {
  const services = {
    database: { status: "healthy", latency: "45ms", uptime: "99.9%" },
    api: { status: "healthy", latency: "120ms", uptime: "99.8%" },
    cache: { status: "degraded", latency: "200ms", uptime: "98.5%" }
  };

  const systemHealth = Object.values(services).every(s => s.status === "healthy");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-8"
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        System Health Status
      </motion.h1>
      
      <div className="space-y-6">
        <HoverCard>
          <HoverCardTrigger>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Badge 
                variant={systemHealth ? "default" : "destructive"}
                className="flex items-center gap-2 cursor-pointer text-lg p-2"
              >
                {systemHealth ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>All Systems Operational</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span>System Degradation Detected</span>
                  </>
                )}
              </Badge>
            </motion.div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {Object.entries(services).map(([service, details], index) => (
                <motion.div 
                  key={service} 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{service}</span>
                    <Badge 
                      variant={details.status === "healthy" ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {details.status === "healthy" ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Healthy</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>Degraded</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Latency: {details.latency}</div>
                    <div>Uptime: {details.uptime}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </HoverCardContent>
        </HoverCard>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6"
        >
          <h2 className="text-xl font-bold mb-4">Usage Statistics</h2>
          <div className="space-y-4">
            <TotalRequests />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
